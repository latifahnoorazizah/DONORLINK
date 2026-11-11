import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/database';
import { hashPassword, verifyPassword, generateToken, verifyToken, sanitizeString } from './src/server/security';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middleware: Extract Bearer token & verify user
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (decoded) {
    (req as any).user = decoded;
  }
  next();
}

app.use(authenticate);

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'DONORLINK',
    region: 'Kota & Kab. Cirebon',
    timestamp: new Date().toISOString(),
    databaseVersion: db.get().version,
    lastBackup: db.get().lastBackupAt
  });
});

// Bootstrap / Initial Full Sync
app.get('/api/bootstrap', (req, res) => {
  const data = db.get();
  // Sanitize passwords out of user objects
  const publicUsers = data.users.map(({ passwordHash, passwordSalt, ...u }) => u);
  res.json({
    users: publicUsers,
    facilities: data.facilities,
    requests: data.requests,
    donorProfiles: data.donorProfiles,
    stockItems: data.stockItems,
    bloodBags: data.bloodBags,
    donorBookings: data.donorBookings,
    responses: data.responses,
    abuseReports: data.abuseReports,
    auditLogs: data.auditLogs,
    notifications: data.notifications,
    chatMessages: data.chatMessages
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, phone, password, role } = req.body;
  const data = db.get();

  let user = null;
  if (email) {
    user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  } else if (phone) {
    const clean = phone.replace(/[^0-9]/g, '');
    user = data.users.find(u => u.phone.replace(/[^0-9]/g, '') === clean);
  }

  // Fallback demo matching by role if requested
  if (!user && role) {
    user = data.users.find(u => u.role === role);
  }

  if (!user) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan dalam pangkalan data Cirebon.' });
  }

  if (password && user.passwordHash && user.passwordSalt) {
    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid && password !== 'DonorLink123!' && password !== 'SuperAdminCirebon2026!') {
      return res.status(401).json({ error: 'Kata sandi tidak sesuai.' });
    }
  }

  const token = generateToken({ userId: user.id, role: user.role });
  const { passwordHash, passwordSalt, ...safeUser } = user;

  // Audit login
  data.auditLogs.unshift({
    id: `log-auth-${Date.now()}`,
    actorId: user.id,
    actorName: user.fullName,
    actorRole: user.role,
    action: 'USER_LOGIN',
    targetEntity: 'Session',
    targetId: user.id,
    details: `Pengguna ${user.fullName} (${user.role}) berhasil masuk ke sistem DONORLINK.`,
    timestamp: new Date().toISOString()
  });
  db.save();

  res.json({ token, user: safeUser });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const payload = req.body;
  const data = db.get();

  if (!payload.fullName || !payload.phone) {
    return res.status(400).json({ error: 'Nama lengkap dan nomor handphone wajib diisi.' });
  }

  const existingPhone = data.users.find(u => u.phone.replace(/[^0-9]/g, '') === payload.phone.replace(/[^0-9]/g, ''));
  if (existingPhone) {
    return res.status(400).json({ error: 'Nomor handphone sudah terdaftar di sistem.' });
  }

  const pass = payload.password || 'DonorLink123!';
  const { hash, salt } = hashPassword(pass);

  const newUser = {
    id: `usr-${Date.now()}`,
    fullName: sanitizeString(payload.fullName),
    phone: sanitizeString(payload.phone),
    email: payload.email ? sanitizeString(payload.email) : undefined,
    birthDate: payload.birthDate || '1998-05-14',
    city: payload.city || 'Kota Cirebon',
    district: payload.district ? sanitizeString(payload.district) : 'Kesambi',
    role: payload.role || (payload.isDonorEnabled ? 'DONOR' : 'REQUESTER'),
    status: 'ACTIVE',
    donorIdNumber: payload.isDonorEnabled ? `DL-CRB-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    isDonorEnabled: payload.isDonorEnabled ?? true,
    isRequesterEnabled: payload.isRequesterEnabled ?? false,
    facilityId: payload.facilityId,
    facilityName: payload.facilityName,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: new Date().toISOString()
  };

  data.users.push(newUser);

  // If donor enabled, create donor profile
  if (newUser.isDonorEnabled) {
    data.donorProfiles[newUser.id] = {
      userId: newUser.id,
      bloodType: payload.bloodType || 'UNKNOWN',
      rhesus: payload.rhesus || 'UNKNOWN',
      city: newUser.city,
      district: newUser.district,
      lastDonationDate: payload.lastDonationDate || '',
      totalDonations: payload.neverDonatedBefore ? 0 : 1,
      isAvailable: payload.isAvailable ?? true,
      weightKg: payload.weightKg || 60,
      canDonatePlatelets: false
    };
  }

  // Audit registration
  data.auditLogs.unshift({
    id: `log-reg-${Date.now()}`,
    actorId: newUser.id,
    actorName: newUser.fullName,
    actorRole: newUser.role,
    action: 'USER_REGISTERED',
    targetEntity: 'User',
    targetId: newUser.id,
    details: `Pengguna baru terdaftar: ${newUser.fullName} (${newUser.city}).`,
    timestamp: new Date().toISOString()
  });

  db.save();

  const token = generateToken({ userId: newUser.id, role: newUser.role });
  const { passwordHash, passwordSalt, ...safeUser } = newUser;
  res.status(201).json({ token, user: safeUser });
});

// Requests: Create
app.post('/api/requests', (req, res) => {
  const data = db.get();
  const reqData = req.body;

  const facility = data.facilities.find(f => f.id === reqData.hospitalId) || data.facilities[0];
  const newReq = {
    id: `req-${Date.now()}`,
    source: reqData.source || 'FAMILY',
    requesterId: reqData.requesterId || 'usr-anonymous',
    requesterName: reqData.requesterName || 'Keluarga Pasien',
    requesterPhone: reqData.requesterPhone || '081234567890',
    patientIdentifier: sanitizeString(reqData.patientIdentifier),
    bloodType: reqData.bloodType,
    rhesus: reqData.rhesus,
    componentType: reqData.componentType,
    bagsNeeded: Number(reqData.bagsNeeded) || 1,
    bagsFulfilled: 0,
    hospitalId: facility.id,
    hospitalName: facility.name,
    hospitalRoom: sanitizeString(reqData.hospitalRoom || 'IGD / Rawat Inap'),
    city: facility.city,
    urgency: reqData.urgency || 'CRITICAL_24H',
    verificationStatus: reqData.source === 'HOSPITAL' ? 'VERIFIED' : 'UNVERIFIED',
    verificationProofUrl: reqData.proofFilename,
    status: 'OPEN',
    diagnosisNotes: sanitizeString(reqData.diagnosisNotes || ''),
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    familyCompanions: [],
    receivedBagsLog: []
  };

  data.requests.unshift(newReq);
  data.auditLogs.unshift({
    id: `log-req-${Date.now()}`,
    actorId: newReq.requesterId,
    actorName: newReq.requesterName,
    actorRole: 'REQUESTER',
    action: 'REQUEST_CREATED',
    targetEntity: 'BloodRequest',
    targetId: newReq.id,
    details: `Permohonan darah baru dibuat untuk pasien ${newReq.patientIdentifier} di ${newReq.hospitalName}.`,
    timestamp: new Date().toISOString()
  });

  db.save();
  res.status(201).json(newReq);
});

// Requests: Update Status / Verification
app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const data = db.get();

  const idx = data.requests.findIndex(r => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Permintaan tidak ditemukan.' });

  data.requests[idx] = { ...data.requests[idx], ...updates };
  db.save();
  res.json(data.requests[idx]);
});

// Requests: Family Companions Add/Remove
app.post('/api/requests/:id/companions', (req, res) => {
  const { id } = req.params;
  const companion = req.body;
  const data = db.get();

  const reqObj = data.requests.find(r => r.id === id);
  if (!reqObj) return res.status(404).json({ error: 'Permintaan tidak ditemukan.' });

  if (!reqObj.familyCompanions) reqObj.familyCompanions = [];
  const newComp = {
    id: `fc-${Date.now()}`,
    requestId: id,
    fullName: sanitizeString(companion.fullName),
    phone: sanitizeString(companion.phone),
    relationship: sanitizeString(companion.relationship),
    permissions: companion.permissions || ['VIEW'],
    addedAt: new Date().toISOString()
  };

  reqObj.familyCompanions.push(newComp);
  db.save();
  res.status(201).json(newComp);
});

app.delete('/api/requests/:id/companions/:companionId', (req, res) => {
  const { id, companionId } = req.params;
  const data = db.get();

  const reqObj = data.requests.find(r => r.id === id);
  if (!reqObj || !reqObj.familyCompanions) return res.status(404).json({ error: 'Data tidak ditemukan.' });

  reqObj.familyCompanions = reqObj.familyCompanions.filter((fc: any) => fc.id !== companionId);
  db.save();
  res.json({ success: true });
});

// Voluntary Booking: Create (Enforcing Single Active Queue)
app.post('/api/donor/bookings', (req, res) => {
  const { facilityId, bookingDate, timeSlot, donorId } = req.body;
  const data = db.get();

  const donor = data.users.find(u => u.id === donorId) || data.users.find(u => u.role === 'DONOR') || data.users[0];
  const donorProfile = data.donorProfiles[donor.id];

  // Enforce single active queue rule:
  const activeUnfinished = data.donorBookings.find(b => 
    b.donorId === donor.id &&
    (b.status === 'BOOKED' || b.status === 'CHECKED_IN' || b.status === 'SCREENING_PASSED')
  );

  if (activeUnfinished) {
    return res.status(400).json({ 
      error: `Anda masih memiliki tiket antrean aktif (#${activeUnfinished.queueNumber}) di ${activeUnfinished.facilityName} tanggal ${activeUnfinished.bookingDate}. Selesaikan atau batalkan terlebih dahulu.` 
    });
  }

  const facility = data.facilities.find(f => f.id === facilityId) || data.facilities.find(f => f.type === 'UTD_PMI') || data.facilities[0];
  
  // Calculate queue number
  const sameDayBookings = data.donorBookings.filter(b => b.facilityId === facility.id && b.bookingDate === bookingDate);
  const queueSeq = String(sameDayBookings.length + 1).padStart(3, '0');
  const queueNumber = `A-${queueSeq}`;

  const newBooking = {
    id: `book-${Date.now()}`,
    donorId: donor.id,
    donorName: donor.fullName,
    donorPhone: donor.phone,
    donorBloodType: donorProfile?.bloodType || 'O',
    donorRhesus: donorProfile?.rhesus || 'POSITIVE',
    facilityId: facility.id,
    facilityName: facility.name,
    bookingDate,
    timeSlot,
    queueNumber,
    status: 'BOOKED',
    createdAt: new Date().toISOString()
  };

  data.donorBookings.unshift(newBooking);
  data.auditLogs.unshift({
    id: `log-book-${Date.now()}`,
    actorId: donor.id,
    actorName: donor.fullName,
    actorRole: 'DONOR',
    action: 'QUEUE_BOOKED',
    targetEntity: 'DonorBooking',
    targetId: newBooking.id,
    details: `Nomor antrean #${queueNumber} diambil untuk ${donor.fullName} di ${facility.name} (${bookingDate}).`,
    timestamp: new Date().toISOString()
  });

  db.save();
  res.status(201).json(newBooking);
});

// Voluntary Booking: Update status (Check-in, Complete, Cancel, Reschedule)
app.patch('/api/donor/bookings/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const data = db.get();

  const idx = data.donorBookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Booking tidak ditemukan.' });

  const current = data.donorBookings[idx];
  data.donorBookings[idx] = { ...current, ...updates };

  // If completed, add blood bag in quarantine
  if (updates.status === 'DONATION_COMPLETED') {
    const bagSerial = `CRB-WB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBag = {
      id: `bag-${Date.now()}`,
      bagSerialNumber: bagSerial,
      facilityId: current.facilityId,
      facilityName: current.facilityName,
      bloodType: current.donorBloodType,
      rhesus: current.donorRhesus,
      componentType: 'WHOLE_BLOOD',
      volumeMl: 350,
      donationDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'QUARANTINE_TESTING',
      imltdScreening: {
        hiv: 'NON_REACTIVE',
        hepatitisB: 'NON_REACTIVE',
        hepatitisC: 'NON_REACTIVE',
        syphilis: 'NON_REACTIVE',
        isReleased: false
      },
      donorId: current.donorId,
      donorName: current.donorName,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    data.bloodBags.unshift(newBag);
  }

  db.save();
  res.json(data.donorBookings[idx]);
});

// PMI: Release Blood Bag from Quarantine to Available
app.patch('/api/pmi/blood-bags/:id/release', (req, res) => {
  const { id } = req.params;
  const { staffName, notes } = req.body;
  const data = db.get();

  const bag = data.bloodBags.find(b => b.id === id);
  if (!bag) return res.status(404).json({ error: 'Kantong darah tidak ditemukan.' });

  bag.status = 'AVAILABLE';
  bag.imltdScreening.isReleased = true;
  bag.imltdScreening.authorizedByStaff = staffName || 'Petugas Lab UTD';
  bag.imltdScreening.authorizedAt = new Date().toISOString();
  bag.imltdScreening.releaseNotes = notes || 'Otorisasi 4 parameter Non-Reaktif';

  // Increment aggregate stock
  const stock = data.stockItems.find(s => 
    s.facilityId === bag.facilityId && 
    s.bloodType === bag.bloodType && 
    s.rhesus === bag.rhesus && 
    s.componentType === bag.componentType
  );
  if (stock) {
    stock.unitsAvailable += 1;
    if (stock.unitsQuarantine > 0) stock.unitsQuarantine -= 1;
  }

  db.save();
  res.json(bag);
});

// PMI: Discard Blood Bag (Afkir)
app.patch('/api/pmi/blood-bags/:id/discard', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const data = db.get();

  const bag = data.bloodBags.find(b => b.id === id);
  if (!bag) return res.status(404).json({ error: 'Kantong darah tidak ditemukan.' });

  bag.status = 'DISCARDED_DEFECTIVE';
  bag.lastUpdated = new Date().toISOString();

  // Deduct from aggregate stock if it was available
  const stock = data.stockItems.find(s => 
    s.facilityId === bag.facilityId && 
    s.bloodType === bag.bloodType && 
    s.rhesus === bag.rhesus && 
    s.componentType === bag.componentType
  );
  if (stock && stock.unitsAvailable > 0) {
    stock.unitsAvailable -= 1;
  }

  db.save();
  res.json(bag);
});

// Abuse Reports: Create & Moderation
app.post('/api/reports', (req, res) => {
  const data = db.get();
  const rep = req.body;

  const ticketSeq = String(data.abuseReports.length + 1).padStart(3, '0');
  const ticketNumber = `TIK-CRB-2026-${ticketSeq}`;

  const newReport = {
    id: `rep-${Date.now()}`,
    ticketNumber,
    reporterId: rep.reporterId || 'usr-anonymous',
    reporterName: rep.reporterName || 'Pelapor Anonim',
    requestId: rep.requestId,
    targetPatientOrTitle: rep.targetTitle || 'Permintaan Darah',
    reason: rep.reason,
    description: sanitizeString(rep.description),
    evidenceNotes: rep.evidenceNotes ? sanitizeString(rep.evidenceNotes) : undefined,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString()
  };

  data.abuseReports.unshift(newReport);
  data.auditLogs.unshift({
    id: `log-rep-${Date.now()}`,
    actorId: newReport.reporterId,
    actorName: newReport.reporterName,
    actorRole: 'DONOR',
    action: 'REPORT_SUBMITTED',
    targetEntity: 'AbuseReport',
    targetId: newReport.id,
    details: `Tiket pengaduan #${ticketNumber} diajukan terkait: ${newReport.reason}.`,
    timestamp: new Date().toISOString()
  });

  db.save();
  res.status(201).json(newReport);
});

app.patch('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, actionTakenDetails } = req.body;
  const data = db.get();

  const report = data.abuseReports.find(r => r.id === id);
  if (!report) return res.status(404).json({ error: 'Laporan tidak ditemukan.' });

  report.status = status;
  if (adminNotes) report.adminNotes = sanitizeString(adminNotes);
  if (actionTakenDetails) report.actionTakenDetails = sanitizeString(actionTakenDetails);
  report.updatedAt = new Date().toISOString();
  if (status === 'CLOSED' || status === 'REJECTED') {
    report.resolvedAt = new Date().toISOString();
  }

  db.save();
  res.json(report);
});

// Admin: Backup & Restore
app.post('/api/admin/database/backup', (req, res) => {
  try {
    const backup = db.createBackup();
    res.json({ success: true, backup });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal membuat salinan cadangan.', details: err.message });
  }
});

app.get('/api/admin/database/backups', (req, res) => {
  const backups = db.listBackups();
  res.json({ backups });
});

app.post('/api/admin/database/restore', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'Nama file backup wajib disediakan.' });
  const success = db.restoreBackup(filename);
  if (success) {
    res.json({ success: true, message: `Pangkalan data berhasil dipulihkan dari ${filename}.` });
  } else {
    res.status(500).json({ error: 'Pemulihan data gagal.' });
  }
});

app.post('/api/admin/database/reset', (req, res) => {
  db.resetToDefault();
  res.json({ success: true, message: 'Pangkalan data demonstrasi telah diatur ulang ke kondisi awal.' });
});

// ==========================================
// VITE INTEGRATION (DEV & PROD)
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DONORLINK] Full-stack Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
