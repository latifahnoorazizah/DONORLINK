import { 
  HealthcareFacility, 
  User, 
  DonorProfile, 
  BloodRequest, 
  DonorResponse, 
  AuditLog, 
  AbuseReport,
  NotificationItem,
  BloodStockItem,
  BloodBagItem,
  StockTransaction,
  DonorBooking,
  ChatThread,
  ChatMessage,
  FaqItem,
  UserPrivacySettings
} from '../types';

export const INITIAL_FACILITIES: HealthcareFacility[] = [
  {
    id: 'fac-gunungjati',
    name: 'RSUD Gunung Jati Kota Cirebon',
    type: 'HOSPITAL',
    city: 'Kota Cirebon',
    address: 'Jl. Kesambi No.56, Drajat, Kec. Kesambi, Kota Cirebon',
    phone: '(0231) 206330 ext. BDRS',
    isVerified: true,
    operationHours: 'BDRS 24 Jam',
    activeBloodBagsEstimate: {
      A_POS: 18,
      B_POS: 14,
      AB_POS: 6,
      O_POS: 24,
      A_NEG: 1,
      B_NEG: 0,
      AB_NEG: 0,
      O_NEG: 1,
    }
  },
  {
    id: 'fac-arjawinangun',
    name: 'RSUD Arjawinangun Kabupaten Cirebon',
    type: 'HOSPITAL',
    city: 'Kabupaten Cirebon',
    address: 'Jl. By Pass Palimanan-Jakarta KM 2, Arjawinangun, Kab. Cirebon',
    phone: '(0231) 358330',
    isVerified: true,
    operationHours: 'Unit Transfusi 24 Jam',
    activeBloodBagsEstimate: {
      A_POS: 15,
      B_POS: 12,
      AB_POS: 5,
      O_POS: 19,
      A_NEG: 1,
      B_NEG: 1,
      AB_NEG: 0,
      O_NEG: 1,
    }
  },
  {
    id: 'fac-ciremai',
    name: 'RS Tk. III Ciremai Kota Cirebon',
    type: 'HOSPITAL',
    city: 'Kota Cirebon',
    address: 'Jl. Kesambi No.237, Drajat, Kec. Kesambi, Kota Cirebon',
    phone: '(0231) 238335',
    isVerified: true,
    operationHours: 'Bank Darah 24 Jam',
    activeBloodBagsEstimate: {
      A_POS: 12,
      B_POS: 10,
      AB_POS: 4,
      O_POS: 16,
      A_NEG: 0,
      B_NEG: 0,
      AB_NEG: 0,
      O_NEG: 1,
    }
  },
  {
    id: 'fac-mitraplumbon',
    name: 'RS Mitra Plumbon Cirebon',
    type: 'HOSPITAL',
    city: 'Kabupaten Cirebon',
    address: 'Jl. Raya Plumbon KM 11, Gombang, Kec. Plumbon, Kab. Cirebon',
    phone: '(0231) 323100',
    isVerified: true,
    operationHours: 'BDRS 24 Jam',
    activeBloodBagsEstimate: {
      A_POS: 20,
      B_POS: 16,
      AB_POS: 7,
      O_POS: 22,
      A_NEG: 1,
      B_NEG: 0,
      AB_NEG: 0,
      O_NEG: 1,
    }
  },
  {
    id: 'fac-waled',
    name: 'RSUD Waled Kabupaten Cirebon',
    type: 'HOSPITAL',
    city: 'Kabupaten Cirebon',
    address: 'Jl. Prabu Kiansantang No.4, Waled Kota, Kec. Waled, Kab. Cirebon',
    phone: '(0231) 661191',
    isVerified: true,
    operationHours: 'BDRS 24 Jam',
    activeBloodBagsEstimate: {
      A_POS: 11,
      B_POS: 9,
      AB_POS: 3,
      O_POS: 14,
      A_NEG: 0,
      B_NEG: 0,
      AB_NEG: 0,
      O_NEG: 1,
    }
  },
  {
    id: 'fac-pelabuhan',
    name: 'RS Pelabuhan Cirebon',
    type: 'HOSPITAL',
    city: 'Kota Cirebon',
    address: 'Jl. Sisingamangaraja No.45, Panjunan, Kec. Lemahwungkuk, Kota Cirebon',
    phone: '(0231) 203808',
    isVerified: true,
    operationHours: 'BDRS 24 Jam',
    activeBloodBagsEstimate: {
      A_POS: 10,
      B_POS: 8,
      AB_POS: 3,
      O_POS: 12,
      A_NEG: 0,
      B_NEG: 0,
      AB_NEG: 0,
      O_NEG: 0,
    }
  },
  {
    id: 'fac-pmi-kotacirebon',
    name: 'UTD PMI Kota Cirebon',
    type: 'UTD_PMI',
    city: 'Kota Cirebon',
    address: 'Jl. DR. Sudarsono No.14, Kesambi, Kec. Kesambi, Kota Cirebon',
    phone: '(0231) 205650',
    isVerified: true,
    operationHours: '24 Jam Setiap Hari',
    activeBloodBagsEstimate: {
      A_POS: 45,
      B_POS: 52,
      AB_POS: 18,
      O_POS: 68,
      A_NEG: 3,
      B_NEG: 2,
      AB_NEG: 1,
      O_NEG: 3,
    }
  },
  {
    id: 'fac-pmi-kabcirebon',
    name: 'UTD PMI Kabupaten Cirebon',
    type: 'UTD_PMI',
    city: 'Kabupaten Cirebon',
    address: 'Jl. Dewi Sartika No.39, Tukmudal, Kec. Sumber, Kab. Cirebon',
    phone: '(0231) 321118',
    isVerified: true,
    operationHours: '24 Jam Setiap Hari',
    activeBloodBagsEstimate: {
      A_POS: 38,
      B_POS: 44,
      AB_POS: 14,
      O_POS: 55,
      A_NEG: 2,
      B_NEG: 1,
      AB_NEG: 1,
      O_NEG: 2,
    }
  },
  {
    id: 'fac-klinik-weru',
    name: 'Klinik Medika Pratama Weru (Baru Diajukan)',
    type: 'HOSPITAL',
    city: 'Kabupaten Cirebon',
    address: 'Jl. Fatahillah No.18, Weru Kidul, Kec. Weru, Kab. Cirebon',
    phone: '(0231) 325500',
    isVerified: false,
    operationHours: '08.00 - 21.00 WIB'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-donor-dimas',
    email: 'dimas.pratama@donorlink.id',
    fullName: 'Dimas Pratama',
    phone: '0812-3456-7890',
    birthDate: '1998-05-14',
    age: 28,
    city: 'Kota Cirebon',
    district: 'Kesambi',
    role: 'DONOR',
    status: 'ACTIVE',
    isDonorEnabled: true,
    isRequesterEnabled: true,
    donorIdNumber: 'DL-CRB-9814-01',
    bloodTypeVerified: true,
    isPhoneVerified: true,
    isEmailVerified: true,
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'user-donor-maya',
    email: 'maya.indah@donorlink.id',
    fullName: 'Maya Indah Lestari',
    phone: '0813-8899-7766',
    birthDate: '1995-11-20',
    age: 31,
    city: 'Kota Cirebon',
    district: 'Kejaksan',
    role: 'DONOR',
    status: 'ACTIVE',
    isDonorEnabled: true,
    isRequesterEnabled: false,
    donorIdNumber: 'DL-CRB-9520-02',
    bloodTypeVerified: true,
    isPhoneVerified: true,
    isEmailVerified: true,
    createdAt: '2026-07-15T09:30:00Z'
  },
  {
    id: 'user-donor-rizky',
    email: 'rizky.ananda@donorlink.id',
    fullName: 'Rizky Ananda',
    phone: '0819-4455-6677',
    birthDate: '2001-08-17',
    age: 25,
    city: 'Kabupaten Cirebon',
    district: 'Sumber',
    role: 'DONOR',
    status: 'ACTIVE',
    isDonorEnabled: true,
    isRequesterEnabled: true,
    donorIdNumber: 'DL-CRB-0117-03',
    bloodTypeVerified: true,
    isPhoneVerified: true,
    isEmailVerified: true,
    createdAt: '2026-09-01T14:20:00Z'
  },
  {
    id: 'user-requester-rian',
    email: 'rian.setyadi@keluargapasien.id',
    fullName: 'Rian Setyadi',
    phone: '0857-1122-3344',
    birthDate: '1990-03-08',
    age: 36,
    city: 'Kota Cirebon',
    district: 'Harjamukti',
    role: 'REQUESTER',
    status: 'ACTIVE',
    isDonorEnabled: false,
    isRequesterEnabled: true,
    donorIdNumber: 'DL-CRB-9008-04',
    bloodTypeVerified: false,
    isPhoneVerified: true,
    isEmailVerified: true,
    createdAt: '2026-10-25T08:00:00Z'
  },
  {
    id: 'user-hospital-hendra',
    email: 'bdrs@rsudgunungjati.cirebonkota.go.id',
    fullName: 'Dr. Hendra Wijaya, Sp.PK',
    phone: '0811-9876-5432',
    role: 'HOSPITAL',
    facilityId: 'fac-gunungjati',
    facilityName: 'RSUD Gunung Jati Kota Cirebon',
    status: 'ACTIVE',
    createdAt: '2026-06-01T08:00:00Z'
  },
  {
    id: 'user-pmi-bambang',
    email: 'koordinasi@pmikotacirebon.or.id',
    fullName: 'Ir. Bambang Hermanto',
    phone: '0812-9988-1122',
    role: 'UTD_PMI',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    status: 'ACTIVE',
    createdAt: '2026-05-15T08:00:00Z'
  },
  {
    id: 'user-admin-siti',
    email: 'admin@donorlink.id',
    fullName: 'Siti Nurhaliza, S.Kom',
    phone: '0812-0000-9999',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_DONOR_PROFILES: Record<string, DonorProfile> = {
  'user-donor-dimas': {
    userId: 'user-donor-dimas',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    city: 'Kota Cirebon',
    district: 'Kesambi',
    lastDonationDate: '2026-08-05',
    isAvailable: true,
    totalDonations: 8,
    weightKg: 68,
    canDonatePlatelets: true
  },
  'user-donor-maya': {
    userId: 'user-donor-maya',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    city: 'Kota Cirebon',
    district: 'Kejaksan',
    lastDonationDate: '2026-07-10',
    isAvailable: true,
    totalDonations: 5,
    weightKg: 56,
    canDonatePlatelets: false
  },
  'user-donor-rizky': {
    userId: 'user-donor-rizky',
    bloodType: 'A',
    rhesus: 'POSITIVE',
    city: 'Kabupaten Cirebon',
    district: 'Sumber',
    lastDonationDate: '2026-10-10',
    isAvailable: false,
    totalDonations: 12,
    weightKg: 72,
    canDonatePlatelets: true
  }
};

export const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'REQ-CRB-2026-001',
    source: 'FAMILY',
    requesterId: 'user-requester-rian',
    requesterName: 'Rian Setyadi (Keluarga Pasien)',
    requesterPhone: '0857-1122-3344',
    patientIdentifier: 'Tn. Haryono S*** (58 th)',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    bagsNeeded: 3,
    bagsFulfilled: 1,
    hospitalId: 'fac-gunungjati',
    hospitalName: 'RSUD Gunung Jati Kota Cirebon',
    hospitalRoom: 'Gedung Teratai Lt. 3 Kamar 312',
    city: 'Kota Cirebon',
    urgency: 'CRITICAL_24H',
    verificationStatus: 'VERIFIED_BY_HOSPITAL',
    verificationProofUrl: 'surat_transfusi_gunungjati_098.pdf',
    verificationNotes: 'Diverifikasi langsung oleh BDRS RSUD Gunung Jati. Pasien anemia berat terjadwal operasi.',
    status: 'PARTIALLY_FULFILLED',
    diagnosisNotes: 'Pasien leukemia mieloblastik membutuhkan transfusi sel darah merah pekat (PRC) segera.',
    expiresAt: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-001',
        requestId: 'REQ-CRB-2026-001',
        type: 'CREATED',
        title: 'Permohonan Dibuat oleh Keluarga',
        description: 'Rian Setyadi mengajukan kebutuhan 3 kantong PRC B+ untuk Tn. Haryono S***.',
        actorName: 'Rian Setyadi',
        actorRole: 'REQUESTER',
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
      },
      {
        id: 'tl-002',
        requestId: 'REQ-CRB-2026-001',
        type: 'VERIFIED',
        title: 'Diverifikasi oleh BDRS RSUD Gunung Jati',
        description: 'Dr. Hendra Wijaya memvalidasi formulir permintaan darah resmi dan indikasi klinis.',
        actorName: 'Dr. Hendra Wijaya, Sp.PK',
        actorRole: 'HOSPITAL',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      },
      {
        id: 'tl-003',
        requestId: 'REQ-CRB-2026-001',
        type: 'DONOR_COMMITTED',
        title: 'Relawan Menyatakan Komitmen Hadir',
        description: 'Maya Indah Lestari (B+) mengonfirmasi estimasi kehadiran pukul 14.30 WIB.',
        actorName: 'Maya Indah Lestari',
        actorRole: 'DONOR',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      },
      {
        id: 'tl-004',
        requestId: 'REQ-CRB-2026-001',
        type: 'BAG_RECEIVED',
        title: '1 Kantong Darah Diterima BDRS',
        description: 'Kantong #BDRS-GJ-9021 dinyatakan lolos uji skrining dan siap ditransfusikan.',
        actorName: 'Dr. Hendra Wijaya, Sp.PK',
        actorRole: 'HOSPITAL',
        timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ],
    receivedBagsLog: [
      {
        id: 'bag-log-001',
        requestId: 'REQ-CRB-2026-001',
        bagSerialNumber: 'BDRS-GJ-9021',
        componentType: 'PRC',
        donorNameOrLab: 'Maya Indah Lestari',
        bloodType: 'B',
        rhesus: 'POSITIVE',
        verifiedBy: 'Dr. Hendra Wijaya, Sp.PK',
        labNotes: 'Lolos uji saring IMLTD & crossmatch serasi',
        receivedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ],
    familyCompanions: [
      {
        id: 'comp-001',
        requestId: 'REQ-CRB-2026-001',
        fullName: 'Siti Nur Aisyah',
        phone: '0858-9988-7711',
        relationship: 'Adik Kandung Pasien',
        permissions: ['VIEW', 'CHAT', 'CONFIRM'],
        addedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'REQ-CRB-2026-002',
    source: 'HOSPITAL', // Penanda diajukan oleh RS
    requesterId: 'user-hospital-hendra',
    requesterName: 'Dr. Hendra Wijaya (BDRS RSUD Gunung Jati)',
    requesterPhone: '0811-9876-5432',
    patientIdentifier: 'An. Farhan Z*** (11 th)',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'WHOLE_BLOOD',
    bagsNeeded: 2,
    bagsFulfilled: 0,
    hospitalId: 'fac-arjawinangun',
    hospitalName: 'RSUD Arjawinangun Kabupaten Cirebon',
    hospitalRoom: 'IGD Bedah Trauma',
    city: 'Kabupaten Cirebon',
    urgency: 'CRITICAL_24H',
    verificationStatus: 'VERIFIED_BY_HOSPITAL',
    verificationProofUrl: 'form_permintaan_darah_arjawinangun_112.pdf',
    verificationNotes: 'Telah terkonfirmasi dokter jaga IGD RSUD Arjawinangun. Pasien trauma kecelakaan.',
    status: 'OPEN',
    diagnosisNotes: 'Trauma tumpul abdomen dengan perdarahan akut. Membutuhkan donor darah lengkap segera.',
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    timeline: [
      {
        id: 'tl-005',
        requestId: 'REQ-CRB-2026-002',
        type: 'CREATED',
        title: 'Diajukan Langsung oleh Rumah Sakit',
        description: 'BDRS mempublikasikan permintaan darurat trauma bedah 2 kantong Whole Blood O+.',
        actorName: 'Dr. Hendra Wijaya, Sp.PK',
        actorRole: 'HOSPITAL',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'REQ-CRB-2026-003',
    source: 'FAMILY',
    requesterId: 'user-requester-ciremai',
    requesterName: 'Ibu Ratna Dewi',
    requesterPhone: '0821-2233-4455',
    patientIdentifier: 'Ny. Siti A*** (32 th)',
    bloodType: 'A',
    rhesus: 'POSITIVE',
    componentType: 'THROMBOCYTE',
    bagsNeeded: 4,
    bagsFulfilled: 0,
    hospitalId: 'fac-ciremai',
    hospitalName: 'RS Tk. III Ciremai Kota Cirebon',
    hospitalRoom: 'Ruang Wijayakusuma Lt. 2',
    city: 'Kota Cirebon',
    urgency: 'URGENT_48H',
    verificationStatus: 'VERIFIED_BY_HOSPITAL',
    verificationProofUrl: 'lampiran_rujukan_ciremai.jpg',
    verificationNotes: 'Hasil lab trombosit pasien < 18.000 uL. Butuh Trombocyte Concentrate (TC).',
    status: 'OPEN',
    diagnosisNotes: 'Demam Berdarah Dengue derajat 3 dengan tanda perdarahan mukosa.',
    expiresAt: new Date(Date.now() + 42 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  },
  {
    id: 'REQ-CRB-2026-004',
    source: 'FAMILY',
    requesterId: 'user-requester-plumbon',
    requesterName: 'Bpk. Tri Wahyudi',
    requesterPhone: '0818-0987-6543',
    patientIdentifier: 'Sdr. Bagus P*** (24 th)',
    bloodType: 'AB',
    rhesus: 'NEGATIVE',
    componentType: 'PRC',
    bagsNeeded: 2,
    bagsFulfilled: 0,
    hospitalId: 'fac-mitraplumbon',
    hospitalName: 'RS Mitra Plumbon Cirebon',
    hospitalRoom: 'Ruang Anggrek 3',
    city: 'Kabupaten Cirebon',
    urgency: 'SCHEDULED',
    verificationStatus: 'UNVERIFIED',
    verificationProofUrl: '',
    verificationNotes: 'Menunggu konfirmasi berkas dari loket BDRS Mitra Plumbon.',
    status: 'OPEN',
    diagnosisNotes: 'Pasien rhesus negatif langka (AB-). Transfusi terjadwal untuk talasemia.',
    expiresAt: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'REQ-CRB-2026-005',
    source: 'FAMILY',
    requesterId: 'user-requester-waled',
    requesterName: 'Ahmad Fadillah',
    requesterPhone: '0812-7711-2299',
    patientIdentifier: 'Ny. Maryam K*** (64 th)',
    bloodType: 'B',
    rhesus: 'NEGATIVE',
    componentType: 'PRC',
    bagsNeeded: 2,
    bagsFulfilled: 2,
    hospitalId: 'fac-waled',
    hospitalName: 'RSUD Waled Kabupaten Cirebon',
    hospitalRoom: 'Ruang Asoka 12',
    city: 'Kabupaten Cirebon',
    urgency: 'URGENT_48H',
    verificationStatus: 'VERIFIED_BY_HOSPITAL',
    verificationProofUrl: 'berkas_waled_tertutup.pdf',
    verificationNotes: 'Dua orang pendonor sukarela telah mendonorkan darah di UTD RSUD Waled. Pasien stabil.',
    status: 'CLOSED_FULFILLED',
    diagnosisNotes: 'Anemia defisiensi berat pasca operasi kebidanan.',
    expiresAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_RESPONSES: DonorResponse[] = [
  {
    id: 'resp-001',
    requestId: 'REQ-CRB-2026-001',
    donorId: 'user-donor-maya',
    donorName: 'Maya Indah Lestari',
    donorBloodType: 'B',
    donorRhesus: 'POSITIVE',
    donorPhone: '0813-8899-7766',
    responseStatus: 'COMMITTED',
    etaDescription: 'Hari ini pukul 14.30 WIB tiba di BDRS RSUD Gunung Jati',
    notes: 'Saya sedang dalam perjalanan dari daerah Kejaksan. Membawa KTP dan kartu pendonor.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

// ============================================
// INITIAL BLOOD STOCK (UTD PMI CIREBON)
// ============================================

export const INITIAL_STOCK_ITEMS: BloodStockItem[] = [
  // UTD PMI Kota Cirebon
  {
    id: 'stock-kc-a-pos-prc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'A',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    unitsAvailable: 24,
    unitsQuarantine: 4,
    unitsReserved: 4,
    minThreshold: 10,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-b-pos-prc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    unitsAvailable: 32,
    unitsQuarantine: 5,
    unitsReserved: 6,
    minThreshold: 12,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-ab-pos-prc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'AB',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    unitsAvailable: 8,
    unitsQuarantine: 2,
    unitsReserved: 2,
    minThreshold: 5,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-o-pos-prc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    unitsAvailable: 42,
    unitsQuarantine: 6,
    unitsReserved: 8,
    minThreshold: 15,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-o-pos-wb',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'WHOLE_BLOOD',
    unitsAvailable: 18,
    unitsQuarantine: 3,
    unitsReserved: 3,
    minThreshold: 8,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-b-pos-tc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'THROMBOCYTE',
    unitsAvailable: 6,
    unitsQuarantine: 2,
    unitsReserved: 2,
    minThreshold: 5,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-a-neg-prc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'A',
    rhesus: 'NEGATIVE',
    componentType: 'PRC',
    unitsAvailable: 2,
    unitsQuarantine: 1,
    unitsReserved: 1,
    minThreshold: 2,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kc-ab-neg-prc',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'AB',
    rhesus: 'NEGATIVE',
    componentType: 'PRC',
    unitsAvailable: 1,
    unitsQuarantine: 0,
    unitsReserved: 0,
    minThreshold: 2,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  // UTD PMI Kabupaten Cirebon
  {
    id: 'stock-kab-o-pos-prc',
    facilityId: 'fac-pmi-kabcirebon',
    facilityName: 'UTD PMI Kabupaten Cirebon',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    unitsAvailable: 28,
    unitsQuarantine: 4,
    unitsReserved: 5,
    minThreshold: 12,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'stock-kab-b-pos-prc',
    facilityId: 'fac-pmi-kabcirebon',
    facilityName: 'UTD PMI Kabupaten Cirebon',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    unitsAvailable: 22,
    unitsQuarantine: 3,
    unitsReserved: 3,
    minThreshold: 10,
    isPublishedToPublic: true,
    lastUpdated: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_BLOOD_BAGS: BloodBagItem[] = [
  {
    id: 'bag-001',
    bagSerialNumber: 'CRB-WB-2026-0041',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'WHOLE_BLOOD',
    volumeMl: 350,
    donationDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 33 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'AVAILABLE',
    imltdScreening: {
      hiv: 'NON_REACTIVE',
      hepatitisB: 'NON_REACTIVE',
      hepatitisC: 'NON_REACTIVE',
      syphilis: 'NON_REACTIVE',
      isReleased: true,
      authorizedByStaff: 'Dr. Hj. Suhartini, M.Kes',
      authorizedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      releaseNotes: 'Lolos uji saring 4 parameter IMLTD non-reaktif'
    },
    donorName: 'Dimas Pratama',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: 'bag-002',
    bagSerialNumber: 'CRB-PRC-2026-0082',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    volumeMl: 250,
    donationDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 34 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'AVAILABLE',
    imltdScreening: {
      hiv: 'NON_REACTIVE',
      hepatitisB: 'NON_REACTIVE',
      hepatitisC: 'NON_REACTIVE',
      syphilis: 'NON_REACTIVE',
      isReleased: true,
      authorizedByStaff: 'Ir. Bambang Hermanto',
      authorizedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      releaseNotes: 'Fraksinasi komponen PRC berhasil dan telah diverifikasi'
    },
    donorName: 'Maya Indah Lestari',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  },
  {
    id: 'bag-003',
    bagSerialNumber: 'CRB-WB-2026-0099',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'WHOLE_BLOOD',
    volumeMl: 350,
    donationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'QUARANTINE_TESTING',
    imltdScreening: {
      hiv: 'PENDING',
      hepatitisB: 'PENDING',
      hepatitisC: 'PENDING',
      syphilis: 'PENDING',
      isReleased: false,
      releaseNotes: 'Sedang dalam inkubasi uji saring IMLTD ELISA di laboratorium UTD'
    },
    donorName: 'Ahmad Fauzi',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'bag-004',
    bagSerialNumber: 'CRB-PRC-2026-0105',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'A',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    volumeMl: 250,
    donationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 35 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'QUARANTINE_TESTING',
    imltdScreening: {
      hiv: 'PENDING',
      hepatitisB: 'PENDING',
      hepatitisC: 'PENDING',
      syphilis: 'PENDING',
      isReleased: false,
      releaseNotes: 'Sampel darah tabung ungu sedang antre di analyzer'
    },
    donorName: 'Siti Rahmawati',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'bag-005',
    bagSerialNumber: 'CRB-PRC-2026-0077',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    volumeMl: 250,
    donationDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 32 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'ALLOCATED',
    allocatedHospitalId: 'fac-gunungjati',
    allocatedHospitalName: 'RSUD Gunung Jati Kota Cirebon',
    requestId: 'REQ-CRB-2026-001',
    patientIdentifier: 'Tn. Haryono S***',
    imltdScreening: {
      hiv: 'NON_REACTIVE',
      hepatitisB: 'NON_REACTIVE',
      hepatitisC: 'NON_REACTIVE',
      syphilis: 'NON_REACTIVE',
      isReleased: true,
      authorizedByStaff: 'Ir. Bambang Hermanto',
      authorizedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'bag-006',
    bagSerialNumber: 'CRB-PRC-2026-0065',
    facilityId: 'fac-pmi-kabcirebon',
    facilityName: 'UTD PMI Kabupaten Cirebon',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    volumeMl: 250,
    donationDate: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 31 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'IN_TRANSIT',
    allocatedHospitalId: 'fac-arjawinangun',
    allocatedHospitalName: 'RSUD Arjawinangun Kabupaten Cirebon',
    dispatchedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    imltdScreening: {
      hiv: 'NON_REACTIVE',
      hepatitisB: 'NON_REACTIVE',
      hepatitisC: 'NON_REACTIVE',
      syphilis: 'NON_REACTIVE',
      isReleased: true,
      authorizedByStaff: 'Dra. Endang Sulastri',
      authorizedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'bag-007',
    bagSerialNumber: 'CRB-TC-2026-0003',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'THROMBOCYTE',
    volumeMl: 150,
    donationDate: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
    expiryDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'EXPIRED',
    imltdScreening: {
      hiv: 'NON_REACTIVE',
      hepatitisB: 'NON_REACTIVE',
      hepatitisC: 'NON_REACTIVE',
      syphilis: 'NON_REACTIVE',
      isReleased: true,
      releaseNotes: 'Melewati masa simpan trombosit 5 hari (suhu 20-24°C agitator)'
    },
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_STOCK_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'stx-001',
    facilityId: 'fac-pmi-kotacirebon',
    type: 'ADD_STOCK',
    bloodType: 'O',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    units: 5,
    batchOrBagNumber: 'UTD-KC-202610-098',
    notes: 'Hasil donor darah sukarela mobil unit donor Kejaksan',
    staffName: 'Ir. Bambang Hermanto',
    timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: 'stx-002',
    facilityId: 'fac-pmi-kotacirebon',
    type: 'ALLOCATE',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    units: 2,
    recipientHospitalOrPatient: 'RSUD Gunung Jati Kota Cirebon',
    notes: 'Alokasi persiapan operasi bedah digestif',
    staffName: 'Ir. Bambang Hermanto',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'stx-003',
    facilityId: 'fac-pmi-kotacirebon',
    type: 'HANDOVER',
    bloodType: 'B',
    rhesus: 'POSITIVE',
    componentType: 'PRC',
    units: 1,
    batchOrBagNumber: 'BDRS-GJ-9021',
    recipientHospitalOrPatient: 'Pasien Tn. Haryono (Teratai 312)',
    notes: 'Penyerahan resmi dengan coolbox terstandar rantai dingin BDRS',
    staffName: 'Ir. Bambang Hermanto',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  }
];

// ============================================
// INITIAL VOLUNTARY DONOR BOOKINGS
// ============================================

export const INITIAL_BOOKINGS: DonorBooking[] = [
  {
    id: 'BOOK-CRB-2601',
    donorId: 'user-donor-dimas',
    donorName: 'Dimas Pratama',
    donorPhone: '0812-3456-7890',
    donorBloodType: 'O',
    donorRhesus: 'POSITIVE',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bookingDate: new Date().toISOString().split('T')[0], // Hari ini
    timeSlot: '08:00 - 10:00',
    queueNumber: 'A-01',
    status: 'CHECKED_IN',
    screeningData: {
      hbLevel: 14.2,
      bloodPressure: '120/80',
      weightKg: 68,
      screeningNotes: 'Lolos uji tensi dan kadar hemoglobin normal. Menunggu antrean bilik pengambilan darah.'
    },
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'BOOK-CRB-2602',
    donorId: 'user-donor-maya',
    donorName: 'Maya Indah Lestari',
    donorPhone: '0813-8899-7766',
    donorBloodType: 'B',
    donorRhesus: 'POSITIVE',
    facilityId: 'fac-pmi-kotacirebon',
    facilityName: 'UTD PMI Kota Cirebon',
    bookingDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0], // Besok
    timeSlot: '10:00 - 12:00',
    queueNumber: 'B-04',
    status: 'BOOKED',
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'BOOK-CRB-2599',
    donorId: 'user-donor-rizky',
    donorName: 'Rizky Ananda',
    donorPhone: '0819-4455-6677',
    donorBloodType: 'A',
    donorRhesus: 'POSITIVE',
    facilityId: 'fac-pmi-kabcirebon',
    facilityName: 'UTD PMI Kabupaten Cirebon',
    bookingDate: '2026-10-10',
    timeSlot: '08:00 - 10:00',
    queueNumber: 'A-02',
    status: 'DONATION_COMPLETED',
    screeningData: {
      hbLevel: 15.0,
      bloodPressure: '118/78',
      weightKg: 72,
      screeningNotes: 'Skrining fisik sangat baik. 1 kantong Whole Blood 350ml berhasil diambil.'
    },
    completionNotes: 'Donor sukarela ke-12 berhasil. Piagam apresiasi digital diperbarui.',
    createdAt: '2026-10-09T08:00:00Z'
  }
];

// ============================================
// INITIAL IN-APP CHAT (CONNECTED TO REQUESTS)
// ============================================

export const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-req-001-maya',
    requestId: 'REQ-CRB-2026-001',
    patientIdentifier: 'Tn. Haryono S*** (58 th)',
    hospitalName: 'RSUD Gunung Jati Kota Cirebon',
    requesterId: 'user-requester-rian',
    requesterName: 'Rian Setyadi',
    donorId: 'user-donor-maya',
    donorName: 'Maya Indah Lestari',
    donorBloodType: 'B',
    donorRhesus: 'POSITIVE',
    isDonorPhoneShared: true,
    isRequesterPhoneShared: true,
    donorPhone: '0813-8899-7766',
    requesterPhone: '0857-1122-3344',
    lastMessageText: 'Baik Mbak Maya, kami tunggu di depan pintu loket BDRS Teratai Lt. 3.',
    lastMessageTimestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isArchived: false,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-001',
    threadId: 'thread-req-001-maya',
    senderId: 'user-donor-maya',
    senderName: 'Maya Indah Lestari',
    senderRole: 'DONOR',
    text: 'Halo Mas Rian, saya bersedia membantu donor darah untuk Tn. Haryono. Estimasi tiba di RSUD Gunung Jati jam 14.30 WIB.',
    timestamp: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-002',
    threadId: 'thread-req-001-maya',
    senderId: 'user-requester-rian',
    senderName: 'Rian Setyadi',
    senderRole: 'REQUESTER',
    text: 'Alhamdulillah, terima kasih banyak Mbak Maya! Berkas pengantar transfusi sudah ada di petugas BDRS.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-003',
    threadId: 'thread-req-001-maya',
    senderId: 'user-donor-maya',
    senderName: 'Maya Indah Lestari',
    senderRole: 'DONOR',
    text: 'Saya sudah menyetujui berbagi kontak WhatsApp agar mudah koordinasi saat sampai di lokasi parkir RS.',
    timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    isRead: true
  },
  {
    id: 'msg-004',
    threadId: 'thread-req-001-maya',
    senderId: 'user-requester-rian',
    senderName: 'Rian Setyadi',
    senderRole: 'REQUESTER',
    text: 'Baik Mbak Maya, kami tunggu di depan pintu loket BDRS Teratai Lt. 3.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isRead: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    actorId: 'user-requester-rian',
    actorName: 'Rian Setyadi',
    actorRole: 'REQUESTER',
    action: 'REQUEST_CREATED',
    targetEntity: 'BloodRequest',
    targetId: 'REQ-CRB-2026-001',
    details: 'Membuat permohonan donor 3 kantong PRC B+ untuk pasien di RSUD Gunung Jati Kota Cirebon.',
    timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
  },
  {
    id: 'log-002',
    actorId: 'user-hospital-hendra',
    actorName: 'Dr. Hendra Wijaya, Sp.PK',
    actorRole: 'HOSPITAL',
    action: 'REQUEST_VERIFIED',
    targetEntity: 'BloodRequest',
    targetId: 'REQ-CRB-2026-001',
    details: 'BDRS memvalidasi kesesuaian berkas rujukan transfusi pasien di ruang Teratai 312.',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'log-003',
    actorId: 'user-donor-maya',
    actorName: 'Maya Indah Lestari',
    actorRole: 'DONOR',
    action: 'DONOR_COMMITTED',
    targetEntity: 'BloodRequest',
    targetId: 'REQ-CRB-2026-001',
    details: 'Pendonor menyatakan kesediaan hadir di RSUD Gunung Jati dengan estimasi jam 14.30 WIB.',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'log-004',
    actorId: 'user-hospital-hendra',
    actorName: 'Dr. Hendra Wijaya, Sp.PK',
    actorRole: 'HOSPITAL',
    action: 'BAG_RECEIVED_UPDATE',
    targetEntity: 'BloodRequest',
    targetId: 'REQ-CRB-2026-001',
    details: '1 kantong darah PRC diterima dari relawan pertama (#BDRS-GJ-9021) dan lolos uji saring BDRS.',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_REPORTS: AbuseReport[] = [
  {
    id: 'rep-001',
    ticketNumber: 'TIK-CRB-2026-001',
    reporterId: 'user-donor-dimas',
    reporterName: 'Dimas Pratama',
    requestId: 'REQ-CRB-2026-001',
    targetPatientOrTitle: 'Dugaan Pungutan Liar / Calo Darah',
    reason: 'COMMERCIAL_SELLING',
    description: 'Ada nomor WhatsApp mengatasnamakan perwakilan keluarga pasien meminta uang tebusan transportasi Rp 250.000 sebelum donor. DonorLink melarang keras segala bentuk komersialisasi darah.',
    evidenceNotes: 'Screenshot chat WhatsApp dengan nomor 0899-xxxx-xxxx meminta transfer uang muka.',
    status: 'IN_REVIEW',
    adminNotes: 'Tim investigasi telah menghubungi nomor terlapor dan memverifikasi identitas asli keluarga pasien di RSUD Gunung Jati.',
    actionTakenDetails: 'Nomor kontak terlapor telah dimasukkan ke daftar pencekalan (blacklist) platform.',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'rep-002',
    ticketNumber: 'TIK-CRB-2026-002',
    reporterId: 'user-hospital-hendra',
    reporterName: 'Dr. Hendra Wijaya, Sp.PK',
    requestId: 'REQ-CRB-2026-003',
    targetPatientOrTitle: 'Permintaan Darah Tidak Ditemukan di Rekam Medis',
    reason: 'SUSPICIOUS_REQUEST',
    description: 'Permohonan atas nama pasien tidak terdaftar di buku register rawat inap RS Tk. III Ciremai.',
    evidenceNotes: 'Pemeriksaan silang SIMRS Ciremai tidak menemukan nama pasien bersangkutan pada tanggal tersebut.',
    status: 'ACTION_TAKEN',
    adminNotes: 'Permohonan telah di-take down sementara dari matching browser publik untuk klarifikasi berkas fisik.',
    actionTakenDetails: 'Status permohonan dinonaktifkan sementara dan pemohon diminta mengunggah ulang surat pengantar sah bertanda tangan DPJP.',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'rep-003',
    ticketNumber: 'TIK-CRB-2026-003',
    reporterId: 'user-donor-maya',
    reporterName: 'Maya Indah Lestari',
    targetPatientOrTitle: 'Spam Pesan Di Luar Aplikasi',
    reason: 'CONTACT_MISUSE',
    description: 'Menerima pesan promosi produk suplemen dari nomor yang mengaku mendapatkan kontak dari komunitas pendonor.',
    evidenceNotes: 'Tangkapan layar pesan SMS promosi yang tidak ada sangkut pautnya dengan aksi donor darah.',
    status: 'CLOSED',
    adminNotes: 'Pelapor diingatkan untuk memanfaatkan fitur penyamaran kontak bawaan DONORLINK.',
    actionTakenDetails: 'Telah diberikan sanksi peringatan ke akun pengirim.',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // Pendonor (Dimas Pratama)
  {
    id: 'notif-donor-001',
    userId: 'user-donor-dimas',
    recipientId: 'user-donor-dimas',
    recipientRole: 'DONOR',
    title: 'Kebutuhan Darah Golongan O+ di RSUD Arjawinangun',
    message: 'Terdapat pasien darurat trauma bedah di Kabupaten Cirebon yang membutuhkan 2 kantong darah lengkap O+.',
    type: 'MATCH',
    category: 'DONOR',
    sourceActivity: 'MATCH_FOUND',
    targetEntityId: 'REQ-CRB-2026-001',
    actionUrl: 'matching-browser',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-donor-002',
    userId: 'user-donor-dimas',
    recipientId: 'user-donor-dimas',
    recipientRole: 'DONOR',
    title: 'Jadwal Antrean Donor Sukarela UTD PMI Hari Ini',
    message: 'Nomor Antrean Anda: A-01 di UTD PMI Kota Cirebon. Silakan lakukan check-in di loket pendaftaran.',
    type: 'BOOKING',
    category: 'DONOR',
    sourceActivity: 'QUEUE_REMINDER',
    targetEntityId: 'book-001',
    actionUrl: 'donor-dashboard',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-donor-003',
    userId: 'user-donor-dimas',
    recipientId: 'user-donor-dimas',
    recipientRole: 'DONOR',
    title: 'Pembaruan Status Laporan Tiket TIK-CRB-2026-001',
    message: 'Laporan dugaan pungutan liar calo telah ditindaklanjuti oleh Administrator. Nomor telah diblacklist.',
    type: 'SYSTEM',
    category: 'DONOR',
    sourceActivity: 'REPORT_UPDATE',
    targetEntityId: 'rep-001',
    actionUrl: 'donor-dashboard',
    priority: 'NORMAL',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },

  // Pencari Donor (Rian Setyadi)
  {
    id: 'notif-req-001',
    userId: 'user-requester-rian',
    recipientId: 'user-requester-rian',
    recipientRole: 'REQUESTER',
    title: 'Relawan Menanggapi Permohonan Anda',
    message: 'Maya Indah Lestari menyatakan bersedia datang ke RSUD Gunung Jati Kota Cirebon (Estimasi 14.30 WIB).',
    type: 'STATUS_CHANGE',
    category: 'REQUESTER',
    sourceActivity: 'DONOR_COMMITTED',
    targetEntityId: 'REQ-CRB-2026-002',
    actionUrl: 'requester-dashboard',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-req-002',
    userId: 'user-requester-rian',
    recipientId: 'user-requester-rian',
    recipientRole: 'REQUESTER',
    title: 'Permohonan Terverifikasi oleh BDRS RSUD Gunung Jati',
    message: 'Dokumen transfusi darah untuk pasien An. Siti Aminah telah disetujui resmi oleh BDRS RSUD Gunung Jati.',
    type: 'VERIFICATION',
    category: 'REQUESTER',
    sourceActivity: 'REQUEST_VERIFIED',
    targetEntityId: 'REQ-CRB-2026-002',
    actionUrl: 'requester-dashboard',
    priority: 'NORMAL',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },

  // Rumah Sakit (Dr. Hendra Wijaya - RSUD Gunung Jati)
  {
    id: 'notif-hosp-001',
    userId: 'user-hospital-hendra',
    recipientId: 'user-hospital-hendra',
    recipientRole: 'HOSPITAL',
    title: 'Permohonan Darah Baru Menunggu Verifikasi',
    message: 'Terdapat 1 permohonan darah baru dari keluarga pasien di Ruang Dahlia 3B yang memerlukan peninjauan berkas BDRS.',
    type: 'VERIFICATION',
    category: 'HOSPITAL',
    sourceActivity: 'NEW_REQUEST_SUBMITTED',
    targetEntityId: 'REQ-CRB-2026-003',
    actionUrl: 'hospital-dashboard',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-hosp-002',
    userId: 'user-hospital-hendra',
    recipientId: 'user-hospital-hendra',
    recipientRole: 'HOSPITAL',
    title: 'Pendonor Bersedia Menuju Lokasi BDRS',
    message: 'Pendonor Dimas Pratama (O+) menyatakan siap hadir di loket BDRS dalam 45 menit untuk permohonan #REQ-CRB-2026-002.',
    type: 'STATUS_CHANGE',
    category: 'HOSPITAL',
    sourceActivity: 'DONOR_ARRIVING',
    targetEntityId: 'REQ-CRB-2026-002',
    actionUrl: 'hospital-dashboard',
    priority: 'NORMAL',
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },

  // UTD PMI (Ir. Bambang Hermanto - UTD PMI Kota Cirebon)
  {
    id: 'notif-pmi-001',
    userId: 'user-pmi-bambang',
    recipientId: 'user-pmi-bambang',
    recipientRole: 'UTD_PMI',
    title: 'Pendaftaran Antrean Donor Sukarela Baru',
    message: 'Tiket antrean baru A-02 telah diterbitkan untuk jadwal donor sesi siang di Gedung UTD PMI Kota Cirebon.',
    type: 'BOOKING',
    category: 'UTD_PMI',
    sourceActivity: 'NEW_BOOKING',
    targetEntityId: 'book-002',
    actionUrl: 'pmi-dashboard',
    priority: 'NORMAL',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-pmi-002',
    userId: 'user-pmi-bambang',
    recipientId: 'user-pmi-bambang',
    recipientRole: 'UTD_PMI',
    title: 'Peringatan Tingkat Stok Darah: AB-',
    message: 'Stok Packed Red Cells (PRC) golongan AB- berada pada level kritis (1 kantong tersisa).',
    type: 'REMINDER',
    category: 'UTD_PMI',
    sourceActivity: 'STOCK_LEVEL_ALERT',
    targetEntityId: 'stock-ab-neg',
    actionUrl: 'pmi-dashboard',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },

  // Super Admin (Siti Nurhaliza / Latifah Noor Azizah)
  {
    id: 'notif-admin-001',
    userId: 'user-admin-siti',
    recipientId: 'user-admin-siti',
    recipientRole: 'ADMIN',
    title: 'Pendaftaran Institusi Faskes Baru',
    message: 'Klinik Medika Pratama Weru mengajukan pendaftaran fasilitas kesehatan. Menunggu tinjauan perizinan dan verifikasi.',
    type: 'SECURITY',
    category: 'ADMIN',
    sourceActivity: 'FACILITY_REGISTRATION',
    targetEntityId: 'fac-klinik-weru',
    actionUrl: 'admin-dashboard',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: 'notif-admin-002',
    userId: 'user-admin-siti',
    recipientId: 'user-admin-siti',
    recipientRole: 'ADMIN',
    title: 'Audit Keamanan Sistem DONORLINK',
    message: 'Integritas enkripsi audit log dan akses nomor identitas pendonor beroperasi normal (Zero Leakage policy).',
    type: 'SYSTEM',
    category: 'ADMIN',
    sourceActivity: 'SYSTEM_SECURITY_EVENT',
    targetEntityId: 'audit-sec-01',
    actionUrl: 'admin-dashboard',
    priority: 'NORMAL',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

export const INITIAL_PRIVACY_SETTINGS: UserPrivacySettings = {
  consentDataProcessing: true,
  consentContactSharing: true,
  profileVisibility: 'PUBLIC_VERIFIED',
  notificationPreferences: {
    email: true,
    sms: false,
    inApp: true,
    emergencyBroadcast: true
  },
  sensitiveDataAccessLog: [
    {
      id: 'sec-log-01',
      accessedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      accessedByRole: 'HOSPITAL',
      accessedByName: 'Dr. Hendra Wijaya, Sp.PK (BDRS RSUD Gunung Jati)',
      purpose: 'Verifikasi berkas pengantar transfusi pasien Tn. Haryono'
    },
    {
      id: 'sec-log-02',
      accessedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      accessedByRole: 'DONOR',
      accessedByName: 'Maya Indah Lestari (Relawan Terdaftar)',
      purpose: 'Melihat nomor narahubung setelah disetujui via toggle WhatsApp'
    }
  ]
};

export const INITIAL_FAQS: FaqItem[] = [
  {
    category: 'SYARAT',
    question: 'Siapa saja yang memenuhi syarat umum mendonorkan darah?',
    answer: 'Calon pendonor harus berusia 17–60 tahun (s.d. 65 tahun jika rutin donor), berat badan minimal 45 kg untuk Whole Blood (55 kg untuk Apheresis), kadar hemoglobin antara 12,5 – 17,0 g/dL, serta tekanan darah sistol 100–140 mmHg dan diastol 70–90 mmHg.'
  },
  {
    category: 'SYARAT',
    question: 'Berapa jarak waktu jeda (interval) minimal antar donor darah?',
    answer: 'Untuk donor Whole Blood (WB / darah lengkap), interval minimal adalah 60 hari (2 bulan). Untuk donor plasma atau trombosit konsentrat melalui mesin apheresis, interval minimal dapat lebih singkat yaitu 14 hari dengan rekomendasi dokter UTD PMI.'
  },
  {
    category: 'PROSES',
    question: 'Apa saja persiapan yang harus dilakukan sebelum datang donor?',
    answer: 'Istirahat cukup (tidur minimal 5 jam pada malam sebelumnya), makan makanan bergizi 3–4 jam sebelum donor, minum banyak air putih (minimal 3–4 gelas), hindari makanan berlemak tinggi sesaat sebelum donor, serta tidak meminum obat pengencer darah seperti aspirin atau antibiotik selama minimal 3 hari.'
  },
  {
    category: 'PROSES',
    question: 'Mengapa darah yang baru didonorkan tidak langsung diberikan ke pasien?',
    answer: 'Setiap kantong darah yang baru diambil wajib melalui proses karantina laboratorium (Uji Saring IMLTD) untuk mendeteksi 4 parameter penyakit menular berbahaya: HIV, Hepatitis B (HBsAg), Hepatitis C (HCV), dan Sifilis (Treponema Pallidum). Darah baru boleh dirilis ke stok siap pakai setelah hasil seluruhnya non-reaktif dan diotorisasi petugas lab.'
  },
  {
    category: 'AFTERCARE',
    question: 'Apa yang harus dilakukan setelah proses pengambilan darah selesai?',
    answer: 'Tekan kasa pada bekas tusukan selama 5–10 menit tanpa digosok, istirahat dan nikmati hidangan penambah tenaga (susu/teh manis dan biskuit) di ruang pemulihan UTD selama 10–15 menit. Hindari mengangkat beban berat dengan lengan yang diambil darahnya selama minimal 6 jam.'
  },
  {
    category: 'LOKASI',
    question: 'Di mana lokasi resmi UTD PMI di wilayah Cirebon?',
    answer: '1. UTD PMI Kota Cirebon: Jl. DR. Sudarsono No. 14, Kesambi, Kota Cirebon (Telepon: 0231-205650, Layanan 24 Jam).\n2. UTD PMI Kabupaten Cirebon: Jl. Fatahillah, Weru, Kab. Cirebon (Telepon: 0231-321118, Layanan 24 Jam).'
  },
  {
    category: 'FAQ',
    question: 'Apakah darah di DONORLINK diperjualbelikan?',
    answer: 'TIDAK. DONORLINK melarang keras segala bentuk komersialisasi darah maupun praktik calo berbayar. Seluruh darah dari pendonor sukarela adalah amal kemanusiaan cuma-cuma. Adapun biaya administrasi resmi di rumah sakit adalah BPPD (Biaya Penggantian Pengolahan Darah) yang diatur oleh Permenkes RI untuk kantong darah steril, reagen uji saring lab, dan rantai dingin penyimpanan, bukan untuk membeli darahnya.'
  }
];

