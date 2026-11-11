export type UserRole = 'DONOR' | 'REQUESTER' | 'HOSPITAL' | 'UTD_PMI' | 'ADMIN';

export type BloodType = 'A' | 'B' | 'AB' | 'O' | 'UNKNOWN';
export type Rhesus = 'POSITIVE' | 'NEGATIVE' | 'UNKNOWN';

export type ComponentType = 
  | 'WHOLE_BLOOD'
  | 'PRC'
  | 'THROMBOCYTE'
  | 'FFP'
  | 'CRYOPRECIPITATE';

export type RequestStatus = 
  | 'OPEN'
  | 'PARTIALLY_FULFILLED'
  | 'CLOSED_FULFILLED'
  | 'CLOSED_EXPIRED'
  | 'CANCELLED';

export type UrgencyLevel = 'CRITICAL_24H' | 'URGENT_48H' | 'SCHEDULED';

export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED_BY_HOSPITAL' | 'VERIFIED_BY_PMI';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  birthDate?: string; // YYYY-MM-DD
  age?: number;
  city?: string;
  district?: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED';
  isDonorEnabled?: boolean;
  isRequesterEnabled?: boolean;
  donorIdNumber?: string;
  bloodTypeVerified?: boolean;
  isPhoneVerified?: boolean;
  isEmailVerified?: boolean;
  facilityId?: string; // If HOSPITAL or UTD_PMI
  facilityName?: string;
  avatarUrl?: string;
  isDemoData?: boolean;
  createdAt: string;
}

export interface DonorProfile {
  userId: string;
  bloodType: BloodType;
  rhesus: Rhesus;
  city: string;
  district: string;
  lastDonationDate: string | null;
  isAvailable: boolean;
  totalDonations: number;
  weightKg?: number;
  canDonatePlatelets?: boolean;
  allowEmergencyNotifications?: boolean;
}

export interface RequestTimelineEvent {
  id: string;
  requestId: string;
  type: 
    | 'CREATED'
    | 'VERIFIED'
    | 'DONOR_COMMITTED'
    | 'DONOR_ARRIVED'
    | 'BAG_RECEIVED'
    | 'STATUS_UPDATED'
    | 'COMPLETED'
    | 'ARCHIVED'
    | 'CANCELLED';
  title: string;
  description: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
}

export interface ReceivedBagLog {
  id: string;
  requestId: string;
  bagSerialNumber: string;
  componentType: ComponentType;
  donorNameOrLab: string;
  bloodType: BloodType;
  rhesus: Rhesus;
  volumeMl?: number;
  verifiedBy: string; // Staff name
  labNotes?: string;
  receivedAt: string;
}

export type CompanionStatus = 'INVITED_PENDING_REGISTRATION' | 'INVITED' | 'ACTIVE' | 'REVOKED';

export interface FamilyCompanion {
  id: string;
  requestId: string;
  fullName: string;
  phone: string;
  relationship: string; // e.g. "Orang Tua", "Anak", "Suami/Istri", "Saudara Kandung", "Kerabat", "Teman"
  email?: string;
  matchedUserId?: string; // ID Akun DONORLINK jika sudah terdaftar
  status?: CompanionStatus;
  permissions: ('VIEW' | 'CHAT' | 'CONFIRM')[];
  consentGiven?: boolean;
  invitationNotes?: string;
  addedAt: string;
}

export interface BloodRequest {
  id: string;
  source: 'FAMILY' | 'HOSPITAL'; // Penanda sumber: Diajukan oleh RS vs Keluarga
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  patientIdentifier: string; // e.g. "Ny. R*** (38 th)"
  bloodType: BloodType;
  rhesus: Rhesus;
  componentType: ComponentType;
  bagsNeeded: number;
  bagsFulfilled: number;
  hospitalId: string;
  hospitalName: string;
  hospitalRoom: string;
  city: string;
  urgency: UrgencyLevel;
  verificationStatus: VerificationStatus;
  verificationProofUrl?: string;
  verificationNotes?: string;
  status: RequestStatus;
  diagnosisNotes?: string;
  expiresAt: string;
  createdAt: string;
  duplicateDetected?: boolean;
  duplicateNotes?: string;
  timeline?: RequestTimelineEvent[];
  receivedBagsLog?: ReceivedBagLog[];
  familyCompanions?: FamilyCompanion[];
  isDemoData?: boolean;
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  donorBloodType: BloodType;
  donorRhesus: Rhesus;
  donorPhone: string;
  responseStatus: 'COMMITTED' | 'SCREENING_FAILED' | 'DONATION_SUCCESS' | 'CANCELLED';
  etaDescription: string;
  notes?: string;
  createdAt: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'UTD_PMI';
  city: string;
  address: string;
  phone: string;
  isVerified: boolean;
  operationHours: string;
  permitNumber?: string;
  picName?: string;
  picPhone?: string;
  isDemoData?: boolean;
  createdAt?: string;
  activeBloodBagsEstimate?: {
    A_POS: number;
    B_POS: number;
    AB_POS: number;
    O_POS: number;
    A_NEG: number;
    B_NEG: number;
    AB_NEG: number;
    O_NEG: number;
  };
}

// ========================
// PMI / UTD BLOOD STOCK & DETAILED BAG INVENTORY
// ========================

export type BloodBagStatus = 
  | 'AVAILABLE'              // Tersedia untuk rujukan/distribusi
  | 'QUARANTINE_TESTING'     // Dalam pemeriksaan lab IMLTD
  | 'ALLOCATED'              // Telah dialokasikan untuk pasien/RS
  | 'IN_TRANSIT'             // Dalam proses pengantaran kurir darah
  | 'RECEIVED_BY_FACILITY'   // Telah diterima BDRS RS tujuan
  | 'EXPIRED'                // Kedaluwarsa
  | 'DISCARDED_DEFECTIVE';   // Rusak / ditarik dari peredaran

export interface ImltdScreeningResult {
  hiv: 'NON_REACTIVE' | 'REACTIVE' | 'PENDING';
  hepatitisB: 'NON_REACTIVE' | 'REACTIVE' | 'PENDING';
  hepatitisC: 'NON_REACTIVE' | 'REACTIVE' | 'PENDING';
  syphilis: 'NON_REACTIVE' | 'REACTIVE' | 'PENDING';
  isReleased: boolean;
  authorizedByStaff?: string;
  authorizedAt?: string;
  releaseNotes?: string;
}

export interface BloodBagItem {
  id: string;
  bagSerialNumber: string; // e.g. "CRB-WB-2026-0042"
  facilityId: string;
  facilityName: string;
  bloodType: BloodType;
  rhesus: Rhesus;
  componentType: ComponentType;
  volumeMl: number;
  donationDate: string;
  expiryDate: string;
  status: BloodBagStatus;
  imltdScreening: ImltdScreeningResult;
  donorId?: string;
  donorName?: string;
  allocatedHospitalId?: string;
  allocatedHospitalName?: string;
  requestId?: string;
  patientIdentifier?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  createdAt: string;
  lastUpdated: string;
}

export interface BloodStockItem {
  id: string;
  facilityId: string;
  facilityName: string;
  bloodType: BloodType;
  rhesus: Rhesus;
  componentType: ComponentType;
  unitsAvailable: number;
  unitsQuarantine: number;
  unitsReserved: number;
  minThreshold: number;
  isPublishedToPublic: boolean;
  lastUpdated: string;
}

export interface StockTransaction {
  id: string;
  facilityId: string;
  type: 'ADD_STOCK' | 'ADJUSTMENT' | 'ALLOCATE' | 'HANDOVER' | 'RELEASE_FROM_QUARANTINE' | 'DISCARD';
  bloodType: BloodType;
  rhesus: Rhesus;
  componentType: ComponentType;
  units: number;
  batchOrBagNumber?: string;
  recipientHospitalOrPatient?: string;
  notes?: string;
  staffName: string;
  timestamp: string;
}

// ========================
// VOLUNTARY DONOR BOOKING & QUEUE
// ========================

export type BookingStatus = 
  | 'BOOKED' 
  | 'CHECKED_IN' 
  | 'SCREENING_PASSED' 
  | 'SCREENING_FAILED' 
  | 'DONATION_COMPLETED' 
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface DonorBooking {
  id: string; // e.g. "BOOK-CRB-081"
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorBloodType: BloodType;
  donorRhesus: Rhesus;
  facilityId: string;
  facilityName: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: '08:00 - 10:00' | '10:00 - 12:00' | '13:00 - 15:00' | '15:00 - 17:00';
  queueNumber?: string; // e.g. "A-01"
  status: BookingStatus;
  screeningData?: {
    hbLevel?: number; // normal 12.5 - 17.0 g/dL
    bloodPressure?: string; // e.g. "120/80"
    weightKg?: number;
    screeningNotes?: string;
  };
  completionNotes?: string;
  rescheduledFromId?: string;
  rescheduledCount?: number;
  sessionQuota?: number;
  createdAt: string;
}

// ========================
// IN-APP CHAT (DONOR & REQUESTER)
// ========================

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isQuickReply?: boolean;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  requestId: string;
  patientIdentifier: string;
  hospitalName: string;
  requesterId: string;
  requesterName: string;
  donorId: string;
  donorName: string;
  donorBloodType: BloodType;
  donorRhesus: Rhesus;
  isDonorPhoneShared: boolean;
  isRequesterPhoneShared: boolean;
  donorPhone: string;
  requesterPhone: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  isArchived?: boolean;
  createdAt: string;
}

// ========================
// CHATBOT DONORLINK ASSISTANT
// ========================

export interface ChatbotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  quickOptions?: string[];
  timestamp: string;
}

// ========================
// PRIVACY, CONSENT & AUDIT LOGS
// ========================

export interface SensitiveDataAccessRecord {
  id: string;
  accessedAt: string;
  accessedByRole: UserRole;
  accessedByName: string;
  purpose: string;
}

export interface UserPrivacySettings {
  consentDataProcessing: boolean; // UU PDP
  consentContactSharing: boolean; // WhatsApp contact consent
  profileVisibility: 'PUBLIC_VERIFIED' | 'FASKES_ONLY' | 'PRIVATE';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    emergencyBroadcast: boolean;
  };
  sensitiveDataAccessLog: SensitiveDataAccessRecord[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export type AbuseReportReason =
  | 'SUSPICIOUS_REQUEST'     // Permintaan darah mencurigakan / komersialisasi
  | 'FAKE_ACCOUNT'          // Akun palsu / catut nama
  | 'CONTACT_MISUSE'        // Penyalahgunaan informasi kontak
  | 'DATA_PRIVACY_BREACH'   // Penyalahgunaan data pribadi
  | 'INAPPROPRIATE_MESSAGE' // Pesan tidak pantas
  | 'MISMATCHED_FACILITY'   // Informasi fasilitas faskes tidak sesuai
  | 'COMMERCIAL_SELLING'    // Calo darah berbayar
  | 'SUSPECTED_SCAM'        // Minta uang transportasi
  | 'EXPIRED_NOT_CLOSED'    // Permintaan kedaluwarsa tapi aktif
  | 'INVALID_CONTACT'       // Kontak palsu
  | 'OTHER';

export type AbuseReportStatus = 
  | 'SUBMITTED' 
  | 'IN_REVIEW' 
  | 'ACTION_TAKEN' 
  | 'REJECTED' 
  | 'CLOSED';

export interface AbuseReport {
  id: string;
  ticketNumber: string; // e.g. "TIK-CRB-2026-001"
  reporterId: string;
  reporterName: string;
  requestId?: string;
  targetPatientOrTitle?: string;
  reason: AbuseReportReason;
  description: string;
  evidenceNotes?: string;
  status: AbuseReportStatus;
  adminNotes?: string;
  actionTakenDetails?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export type NotificationCategory = 
  | 'DONOR'
  | 'REQUESTER'
  | 'HOSPITAL'
  | 'UTD_PMI'
  | 'ADMIN'
  | 'BOOKING' 
  | 'REQUEST' 
  | 'STOCK' 
  | 'REPORT' 
  | 'SYSTEM' 
  | 'QUEUE' 
  | 'VERIFICATION';

export interface NotificationItem {
  id: string;
  userId: string;
  recipientId?: string; // Recipient-based notification
  recipientRole?: UserRole;
  title: string;
  message: string;
  type: 'MATCH' | 'STATUS_CHANGE' | 'VERIFICATION' | 'SYSTEM' | 'CHAT' | 'BOOKING' | 'REMINDER' | 'SECURITY';
  category?: NotificationCategory;
  sourceActivity?: string;
  targetEntityId?: string;
  actionUrl?: string;
  priority?: 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export type HospitalReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
export type HospitalReportCategory = 'BLOOD_REQUESTS' | 'FULFILLMENT' | 'CONNECTED_DONORS' | 'HOSPITAL_ACTIVITY' | 'ALL';

export interface FaqItem {
  question: string;
  answer: string;
  category: 'SYARAT' | 'PROSES' | 'AFTERCARE' | 'LOKASI' | 'FAQ';
}

