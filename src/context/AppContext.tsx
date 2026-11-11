import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  User, 
  UserRole, 
  DonorProfile, 
  BloodRequest, 
  DonorResponse, 
  HealthcareFacility, 
  AuditLog, 
  AbuseReport, 
  NotificationItem, 
  RequestStatus,
  BloodType,
  Rhesus,
  ComponentType,
  UrgencyLevel,
  BloodStockItem,
  StockTransaction,
  DonorBooking,
  ChatThread,
  ChatMessage,
  FamilyCompanion,
  ReceivedBagLog,
  RequestTimelineEvent,
  BloodBagItem,
  UserPrivacySettings,
  SensitiveDataAccessRecord,
  AbuseReportStatus
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_FACILITIES, 
  INITIAL_DONOR_PROFILES, 
  INITIAL_REQUESTS, 
  INITIAL_RESPONSES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_REPORTS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_STOCK_ITEMS,
  INITIAL_STOCK_TRANSACTIONS,
  INITIAL_BOOKINGS,
  INITIAL_CHAT_THREADS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_BLOOD_BAGS,
  INITIAL_PRIVACY_SETTINGS
} from '../data/initialData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface RegisterUserPayload {
  role?: UserRole;
  fullName: string;
  birthDate?: string;
  phone: string;
  email?: string;
  city: string;
  district?: string;
  isDonorEnabled?: boolean;
  isRequesterEnabled?: boolean;
  donorData?: {
    bloodType: BloodType;
    rhesus: Rhesus;
    lastDonationDate?: string | null;
    isAvailable: boolean;
    weightKg?: number;
  };
  facilityData?: {
    facilityName: string;
    facilityType?: 'HOSPITAL' | 'UTD_PMI';
    address: string;
    phone: string;
    permitNumber: string;
    picPosition?: string;
  };
}

interface AppContextType {
  isAuthenticated: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (data: Partial<User>) => void;
  registerNewUser: (payload: RegisterUserPayload) => User;
  activePublicFeature: 'DONOR' | 'REQUESTER';
  setActivePublicFeature: (feature: 'DONOR' | 'REQUESTER') => void;
  
  // Donor Profile
  donorProfiles: Record<string, DonorProfile>;
  currentDonorProfile?: DonorProfile;
  updateCurrentDonorProfile: (data: Partial<DonorProfile>) => void;
  toggleDonorAvailability: () => void;
  
  // Blood Requests & Matching
  requests: BloodRequest[];
  createBloodRequest: (requestData: {
    patientIdentifier: string;
    bloodType: BloodType;
    rhesus: Rhesus;
    componentType: ComponentType;
    bagsNeeded: number;
    hospitalId: string;
    hospitalRoom: string;
    city: string;
    urgency: UrgencyLevel;
    diagnosisNotes?: string;
    proofFilename?: string;
    source?: 'FAMILY' | 'HOSPITAL';
    companion?: {
      fullName: string;
      phone: string;
      relationship: string;
      email?: string;
      permissions: ('VIEW' | 'CHAT' | 'CONFIRM')[];
      consentGiven?: boolean;
    };
  }) => BloodRequest;
  verifyRequestByHospital: (requestId: string, notes?: string) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus, bagsFulfilled?: number) => void;
  checkDuplicateRequest: (patientIdentifier: string, hospitalId: string, bloodType: BloodType) => { isDuplicate: boolean; duplicateCount: number; existingRequest?: BloodRequest };
  recordBagReceipt: (requestId: string, bagData: { bagSerialNumber: string; componentType: ComponentType; donorNameOrLab: string; bloodType: BloodType; rhesus: Rhesus; labNotes?: string }) => void;
  
  // Responses
  responses: DonorResponse[];
  addDonorResponse: (requestId: string, etaDescription: string, notes?: string) => void;
  cancelDonorResponse: (responseId: string) => void;
  
  // Facilities
  facilities: HealthcareFacility[];
  verifyFacility: (facilityId: string) => void;
  rejectFacility: (facilityId: string, reason?: string) => void;
  
  // Stock Management (PMI/UTD)
  stockItems: BloodStockItem[];
  stockTransactions: StockTransaction[];
  bloodBags: BloodBagItem[];
  addOrUpdateStock: (data: { facilityId: string; bloodType: BloodType; rhesus: Rhesus; componentType: ComponentType; unitsChange: number; type: 'ADD_STOCK' | 'ADJUSTMENT'; notes?: string }) => void;
  allocateStock: (data: { stockId: string; units: number; hospitalName: string; notes?: string }) => void;
  handoverStock: (data: { stockId: string; units: number; recipientName: string; batchNumber?: string; notes?: string }) => void;
  releaseBloodBag: (bagId: string, notes?: string) => void;
  discardBloodBag: (bagId: string, reason: string) => void;
  
  // Voluntary Donor Booking & Queue System
  donorBookings: DonorBooking[];
  currentCallingQueue: string;
  callNextQueue: (customNumber?: string) => string;
  createDonorBooking: (data: { facilityId: string; bookingDate: string; timeSlot: DonorBooking['timeSlot'] }) => DonorBooking;
  rescheduleDonorBooking: (bookingId: string, newDate: string, newTimeSlot: DonorBooking['timeSlot']) => DonorBooking;
  checkInBooking: (bookingId: string) => void;
  updateBookingScreening: (bookingId: string, screening: { hbLevel: number; bloodPressure: string; weightKg: number; passed: boolean; notes?: string }) => void;
  completeDonorBooking: (bookingId: string, notes?: string) => void;
  cancelDonorBooking: (bookingId: string) => void;
  
  // In-App Chat
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
  activeChatThreadId: string | null;
  setActiveChatThreadId: (id: string | null) => void;
  sendMessage: (threadId: string, text: string, isQuickReply?: boolean) => void;
  toggleWhatsAppShare: (threadId: string) => void;
  getOrCreateChatThread: (requestId: string, donorId: string) => string;
  archiveChatThread: (threadId: string) => void;
  
  // Family Companion
  addFamilyCompanion: (requestId: string, companion: { fullName: string; phone: string; relationship: string; permissions: ('VIEW' | 'CHAT' | 'CONFIRM')[]; email?: string; consentGiven?: boolean }) => void;
  removeFamilyCompanion: (requestId: string, companionId: string) => void;
  revokeFamilyCompanion: (requestId: string, companionId: string) => void;
  
  // User Privacy & Data Consent
  privacySettings: UserPrivacySettings;
  updatePrivacySettings: (settings: Partial<UserPrivacySettings>) => void;
  logSensitiveDataAccess: (accessedByName: string, accessedByRole: UserRole, purpose: string) => void;

  // Abuse Reports, Audits & Notifications
  abuseReports: AbuseReport[];
  createAbuseReport: (report: { requestId?: string; targetTitle: string; reason: AbuseReport['reason']; description: string; evidenceNotes?: string }) => AbuseReport;
  resolveAbuseReport: (reportId: string, status: 'RESOLVED_VALID' | 'DISMISSED') => void;
  updateAbuseReport: (reportId: string, status: AbuseReportStatus, adminNotes?: string, actionTakenDetails?: string) => void;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  IS_AUTH: 'donorlink_is_authenticated_v4',
  CURRENT_USER: 'donorlink_current_user_v4',
  ALL_USERS: 'donorlink_all_users_v4',
  REQUESTS: 'donorlink_requests_v4',
  RESPONSES: 'donorlink_responses_v4',
  PROFILES: 'donorlink_profiles_v4',
  FACILITIES: 'donorlink_facilities_v4',
  LOGS: 'donorlink_audit_logs_v4',
  REPORTS: 'donorlink_reports_v4',
  NOTIFICATIONS: 'donorlink_notifications_v4',
  ACTIVE_FEATURE: 'donorlink_active_feature_v4',
  STOCK_ITEMS: 'donorlink_stock_items_v5',
  STOCK_TRANSACTIONS: 'donorlink_stock_transactions_v5',
  BLOOD_BAGS: 'donorlink_blood_bags_v5',
  BOOKINGS: 'donorlink_bookings_v5',
  QUEUE_CALL: 'donorlink_queue_call_v5',
  CHAT_THREADS: 'donorlink_chat_threads_v5',
  CHAT_MESSAGES: 'donorlink_chat_messages_v5',
  PRIVACY_SETTINGS: 'donorlink_privacy_settings_v5'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTH);
    return saved === 'true';
  });

  // 1. Users & Current User
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* fallback */ }
    }
    return INITIAL_USERS[0];
  });

  // Active public feature (for users who have both Donor & Requester capabilities)
  const [activePublicFeature, setActivePublicFeatureState] = useState<'DONOR' | 'REQUESTER'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_FEATURE);
    if (saved === 'DONOR' || saved === 'REQUESTER') return saved;
    return currentUser.isRequesterEnabled && !currentUser.isDonorEnabled ? 'REQUESTER' : 'DONOR';
  });

  // 2. Donor Profiles
  const [donorProfiles, setDonorProfiles] = useState<Record<string, DonorProfile>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return saved ? JSON.parse(saved) : INITIAL_DONOR_PROFILES;
  });

  // 3. Requests
  const [requests, setRequests] = useState<BloodRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // 4. Responses
  const [responses, setResponses] = useState<DonorResponse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    return saved ? JSON.parse(saved) : INITIAL_RESPONSES;
  });

  // 5. Facilities
  const [facilities, setFacilities] = useState<HealthcareFacility[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FACILITIES);
    return saved ? JSON.parse(saved) : INITIAL_FACILITIES;
  });

  // 6. Blood Stock Items & Transactions & Detailed Bags
  const [stockItems, setStockItems] = useState<BloodStockItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
  });

  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_TRANSACTIONS;
  });

  const [bloodBags, setBloodBags] = useState<BloodBagItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOOD_BAGS);
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_BAGS;
  });

  // 7. Voluntary Donor Bookings & Queue State
  const [donorBookings, setDonorBookings] = useState<DonorBooking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [currentCallingQueue, setCurrentCallingQueue] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUEUE_CALL);
    return saved || 'A-01';
  });

  // 8. In-App Chat
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_THREADS);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_THREADS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });

  const [activeChatThreadId, setActiveChatThreadId] = useState<string | null>(null);

  // 9. User Privacy & Consent Settings
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_PRIVACY_SETTINGS;
  });

  // 9. Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // 10. Abuse Reports
  const [abuseReports, setAbuseReports] = useState<AbuseReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // 11. Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // 12. Toast feedback
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hydrate from central database on initial load
  useEffect(() => {
    fetch('/api/bootstrap')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        if (data.users?.length) setAllUsers(data.users);
        if (data.facilities?.length) setFacilities(data.facilities);
        if (data.requests?.length) setRequests(data.requests);
        if (data.donorProfiles && Object.keys(data.donorProfiles).length) setDonorProfiles(data.donorProfiles);
        if (data.stockItems?.length) setStockItems(data.stockItems);
        if (data.bloodBags?.length) setBloodBags(data.bloodBags);
        if (data.donorBookings?.length) setDonorBookings(data.donorBookings);
        if (data.responses?.length) setResponses(data.responses);
        if (data.abuseReports?.length) setAbuseReports(data.abuseReports);
        if (data.auditLogs?.length) setAuditLogs(data.auditLogs);
      })
      .catch(err => {
        console.info('[DONORLINK] Running in client mode with local cache');
      });
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTH, isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_FEATURE, activePublicFeature);
  }, [activePublicFeature]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(donorProfiles));
  }, [donorProfiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(stockItems));
  }, [stockItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_TRANSACTIONS, JSON.stringify(stockTransactions));
  }, [stockTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOOD_BAGS, JSON.stringify(bloodBags));
  }, [bloodBags]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(donorBookings));
  }, [donorBookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUEUE_CALL, currentCallingQueue);
  }, [currentCallingQueue]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_THREADS, JSON.stringify(chatThreads));
  }, [chatThreads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(privacySettings));
  }, [privacySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(abuseReports));
  }, [abuseReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAudit = (action: string, entity: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action,
      targetEntity: entity,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth & Session
  const loginUser = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    if (user.role === 'DONOR' || user.role === 'REQUESTER') {
      setActivePublicFeatureState(user.isDonorEnabled ? 'DONOR' : 'REQUESTER');
    }
    showToast({
      type: 'success',
      title: 'Berhasil Masuk',
      message: `Selamat datang, ${user.fullName} (${user.role})`
    });
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    showToast({
      type: 'info',
      title: 'Keluar Akun',
      message: 'Anda telah keluar dari sesi aplikasi.'
    });
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    if (user.role === 'DONOR' || user.role === 'REQUESTER') {
      setActivePublicFeatureState(user.isDonorEnabled ? 'DONOR' : 'REQUESTER');
    }
    showToast({
      type: 'info',
      title: 'Beralih Akun',
      message: `Sekarang masuk sebagai ${user.fullName} (${user.role})`
    });
  };

  const setActivePublicFeature = (feature: 'DONOR' | 'REQUESTER') => {
    setActivePublicFeatureState(feature);
    showToast({
      type: 'info',
      title: `Beralih ke Fitur ${feature === 'DONOR' ? 'Pendonor' : 'Pencari Donor'}`,
      message: 'Profil dan identitas Anda tetap sama dalam satu akun.'
    });
  };

  const switchRole = (role: UserRole) => {
    const targetUser = allUsers.find(u => u.role === role) || allUsers[0];
    setCurrentUserState(targetUser);
    setIsAuthenticated(true);
    if (role === 'DONOR' || role === 'REQUESTER') {
      setActivePublicFeatureState(role);
    }
    showToast({
      type: 'info',
      title: `Beralih ke Dashboard ${role}`,
      message: `Profil aktif: ${targetUser.fullName}`
    });
  };

  // Profile Updates
  const updateUserProfile = (data: Partial<User>) => {
    let updatedAge = currentUser.age;
    if (data.birthDate) {
      const birth = new Date(data.birthDate);
      const diffMs = Date.now() - birth.getTime();
      const calculatedAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
      if (!isNaN(calculatedAge) && calculatedAge > 0) {
        updatedAge = calculatedAge;
      }
    }

    const updatedUser: User = {
      ...currentUser,
      ...data,
      age: updatedAge
    };

    if (data.isDonorEnabled === true) {
      if (!updatedUser.donorIdNumber) {
        updatedUser.donorIdNumber = `DL-CRB-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      setDonorProfiles(prev => {
        const existing = prev[currentUser.id];
        return {
          ...prev,
          [currentUser.id]: existing || {
            userId: currentUser.id,
            bloodType: 'UNKNOWN',
            rhesus: 'UNKNOWN',
            city: updatedUser.city || 'Kota Cirebon',
            district: updatedUser.district || 'Kesambi',
            lastDonationDate: null,
            isAvailable: true,
            totalDonations: 0,
            weightKg: 60,
            canDonatePlatelets: false,
            allowEmergencyNotifications: true
          }
        };
      });
    }

    if (data.isDonorEnabled === false) {
      setDonorProfiles(prev => {
        const existing = prev[currentUser.id];
        if (!existing) return prev;
        return {
          ...prev,
          [currentUser.id]: { ...existing, isAvailable: false }
        };
      });
    }

    setCurrentUserState(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    addAudit('USER_PROFILE_UPDATED', 'User', currentUser.id, 'Pembaruan profil pengguna / pengaturan fitur fleksibel.');
    
    showToast({
      type: 'success',
      title: 'Profil Berhasil Disimpan',
      message: 'Perubahan data identitas dan pengaturan fitur telah diperbarui.'
    });
  };

  // Multi-step Registration (Masyarakat Umum & Faskes RS/PMI)
  const registerNewUser = (payload: RegisterUserPayload): User => {
    const newId = `user-${Date.now().toString(36)}`;

    // Special flow: Registration for Healthcare Facilities (HOSPITAL / UTD_PMI)
    if (payload.role === 'HOSPITAL' || payload.role === 'UTD_PMI') {
      const facId = `fac-reg-${Date.now().toString(36)}`;
      const facName = payload.facilityData?.facilityName || payload.fullName;
      const newFacility: HealthcareFacility = {
        id: facId,
        name: facName,
        type: payload.role === 'HOSPITAL' ? 'HOSPITAL' : 'UTD_PMI',
        city: payload.city || 'Kota Cirebon',
        address: payload.facilityData?.address || 'Kota Cirebon',
        phone: payload.facilityData?.phone || payload.phone,
        isVerified: false,
        operationHours: '24 Jam (Layanan Transfusi/BDRS)',
        permitNumber: payload.facilityData?.permitNumber || 'DINKES/CRB-2026/001',
        picName: payload.fullName,
        picPhone: payload.phone,
        isDemoData: false,
        createdAt: new Date().toISOString()
      };

      const newFacilityUser: User = {
        id: newId,
        fullName: payload.fullName,
        phone: payload.phone,
        email: payload.email || `${facName.toLowerCase().replace(/[^a-z0-9]/g, '')}@donorlink.id`,
        city: payload.city || 'Kota Cirebon',
        district: payload.district || 'Kesambi',
        role: payload.role,
        status: 'PENDING_VERIFICATION',
        facilityId: facId,
        facilityName: facName,
        isDemoData: false,
        createdAt: new Date().toISOString()
      };

      setFacilities(prev => [newFacility, ...prev]);
      setAllUsers(prev => [newFacilityUser, ...prev]);
      setCurrentUserState(newFacilityUser);
      setIsAuthenticated(true);

      addAudit(
        'FACILITY_REGISTRATION_SUBMITTED',
        'HealthcareFacility',
        facId,
        `Pendaftaran institusi baru (${newFacility.type}): ${facName} diajukan oleh ${payload.fullName} (Menunggu Verifikasi Super Admin).`
      );

      showToast({
        type: 'info',
        title: 'Pengajuan Pendaftaran Berhasil',
        message: `Akun fasilitas ${facName} berstatus Menunggu Verifikasi Dokumen oleh Super Admin DONORLINK.`
      });

      // Sync to backend
      fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFacility)
      }).catch(() => {});

      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFacilityUser)
      }).catch(() => {});

      return newFacilityUser;
    }

    // Standard flow: Public users (Pendonor & Pencari Donor)
    const birth = payload.birthDate ? new Date(payload.birthDate) : new Date('1999-05-14');
    const diffMs = Date.now() - birth.getTime();
    let calculatedAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    if (isNaN(calculatedAge) || calculatedAge <= 0) {
      calculatedAge = 25;
    }

    const donorIdNumber = `DL-CRB-${Math.floor(1000 + Math.random() * 9000)}`;

    const primaryRole: UserRole = payload.isDonorEnabled 
      ? 'DONOR' 
      : payload.isRequesterEnabled 
      ? 'REQUESTER' 
      : 'DONOR';

    const newUser: User = {
      id: newId,
      fullName: payload.fullName,
      birthDate: payload.birthDate || '1999-05-14',
      age: calculatedAge,
      phone: payload.phone,
      email: payload.email || `${payload.phone.replace(/[^0-9]/g, '')}@donorlink.id`,
      city: payload.city || 'Kota Cirebon',
      district: payload.district || 'Kesambi',
      role: primaryRole,
      status: 'ACTIVE',
      isDonorEnabled: payload.isDonorEnabled ?? true,
      isRequesterEnabled: payload.isRequesterEnabled ?? false,
      donorIdNumber,
      bloodTypeVerified: false,
      isPhoneVerified: true,
      isEmailVerified: Boolean(payload.email),
      isDemoData: false,
      createdAt: new Date().toISOString()
    };

    if (payload.isDonorEnabled && payload.donorData) {
      const newDonorProfile: DonorProfile = {
        userId: newId,
        bloodType: payload.donorData.bloodType || 'UNKNOWN',
        rhesus: payload.donorData.rhesus || 'UNKNOWN',
        city: payload.city || 'Kota Cirebon',
        district: payload.district || 'Kesambi',
        lastDonationDate: payload.donorData.lastDonationDate || null,
        isAvailable: payload.donorData.isAvailable ?? true,
        totalDonations: 0,
        weightKg: payload.donorData.weightKg || 60,
        canDonatePlatelets: false,
        allowEmergencyNotifications: true
      };

      setDonorProfiles(prev => ({
        ...prev,
        [newId]: newDonorProfile
      }));
    }

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUserState(newUser);
    setIsAuthenticated(true);
    setActivePublicFeatureState(payload.isDonorEnabled ? 'DONOR' : 'REQUESTER');

    addAudit('USER_REGISTERED', 'User', newId, `Pendaftaran pengguna baru: ${newUser.fullName} (${newUser.city}).`);

    // Sync to backend
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    }).catch(() => {});

    showToast({
      type: 'success',
      title: 'Pendaftaran Berhasil!',
      message: `Selamat datang di DONORLINK Cirebon, ${newUser.fullName}.`
    });

    return newUser;
  };

  const currentDonorProfile = donorProfiles[currentUser.id];

  const updateCurrentDonorProfile = (data: Partial<DonorProfile>) => {
    setDonorProfiles(prev => {
      const current = prev[currentUser.id] || {
        userId: currentUser.id,
        bloodType: 'UNKNOWN',
        rhesus: 'UNKNOWN',
        city: currentUser.city || 'Kota Cirebon',
        district: currentUser.district || 'Kesambi',
        lastDonationDate: null,
        isAvailable: true,
        totalDonations: 0
      };
      return {
        ...prev,
        [currentUser.id]: { ...current, ...data }
      };
    });
    addAudit('DONOR_PROFILE_UPDATED', 'DonorProfile', currentUser.id, 'Pembaruan data profil/ketersediaan pendonor Cirebon.');
    showToast({
      type: 'success',
      title: 'Profil Diperbarui',
      message: 'Perubahan data pendonor berhasil disimpan.'
    });
  };

  const toggleDonorAvailability = () => {
    const current = donorProfiles[currentUser.id];
    const newStatus = current ? !current.isAvailable : false;
    updateCurrentDonorProfile({ isAvailable: newStatus });
    showToast({
      type: newStatus ? 'success' : 'info',
      title: newStatus ? 'Status Siap Donor Diaktifkan' : 'Status Istirahat Diaktifkan',
      message: newStatus 
        ? 'Anda kini dapat menerima pemberitahuan kebutuhan darah yang cocok di wilayah Cirebon.' 
        : 'Pemberitahuan panggilan donor dinonaktifkan sementara.'
    });
  };

  // Duplicate Request Detection
  const checkDuplicateRequest = (patientIdentifier: string, hospitalId: string, bloodType: BloodType) => {
    const cleanName = patientIdentifier.trim().toLowerCase();
    const existing = requests.find(r => 
      (r.status === 'OPEN' || r.status === 'PARTIALLY_FULFILLED') &&
      r.hospitalId === hospitalId &&
      (r.patientIdentifier.toLowerCase().includes(cleanName) || cleanName.includes(r.patientIdentifier.toLowerCase())) &&
      r.bloodType === bloodType
    );

    return {
      isDuplicate: Boolean(existing),
      duplicateCount: existing ? 1 : 0,
      existingRequest: existing
    };
  };

  // Create Blood Request
  const createBloodRequest = (data: {
    patientIdentifier: string;
    bloodType: BloodType;
    rhesus: Rhesus;
    componentType: ComponentType;
    bagsNeeded: number;
    hospitalId: string;
    hospitalRoom: string;
    city: string;
    urgency: UrgencyLevel;
    diagnosisNotes?: string;
    proofFilename?: string;
    source?: 'FAMILY' | 'HOSPITAL';
    companion?: {
      fullName: string;
      phone: string;
      relationship: string;
      permissions: ('VIEW' | 'CHAT' | 'CONFIRM')[];
      email?: string;
      consentGiven?: boolean;
    };
  }): BloodRequest => {
    const selectedHospital = facilities.find(f => f.id === data.hospitalId);
    const reqSource = data.source || (currentUser.role === 'HOSPITAL' ? 'HOSPITAL' : 'FAMILY');

    // Duplicate check
    const dupCheck = checkDuplicateRequest(data.patientIdentifier, data.hospitalId, data.bloodType);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const reqId = `REQ-CRB-2026-${randomSuffix}`;

    // Family companion resolution
    let companionRecord: FamilyCompanion | undefined;
    if (data.companion && data.companion.fullName.trim() && data.companion.phone.trim()) {
      const companionPhoneClean = data.companion.phone.replace(/[^0-9]/g, '');
      const matchedUser = allUsers.find(u => {
        const uPhoneClean = u.phone.replace(/[^0-9]/g, '');
        if (companionPhoneClean && uPhoneClean === companionPhoneClean) return true;
        if (data.companion?.email && u.email && u.email.toLowerCase() === data.companion.email.toLowerCase()) return true;
        return false;
      });

      companionRecord = {
        id: `comp-${Date.now()}`,
        requestId: reqId,
        fullName: data.companion.fullName.trim(),
        phone: data.companion.phone.trim(),
        relationship: data.companion.relationship,
        permissions: data.companion.permissions.length > 0 ? data.companion.permissions : ['VIEW', 'CHAT'],
        email: data.companion.email?.trim() || undefined,
        status: matchedUser ? 'ACTIVE' : 'INVITED_PENDING_REGISTRATION',
        matchedUserId: matchedUser?.id,
        consentGiven: data.companion.consentGiven ?? true,
        invitationNotes: matchedUser 
          ? `Akun terdaftar terhubung (${matchedUser.fullName})` 
          : 'Undangan pendamping dikirim via WhatsApp. Akses aktif otomatis saat pengguna mendaftar.',
        addedAt: new Date().toISOString()
      };
    }

    const newReq: BloodRequest = {
      id: reqId,
      source: reqSource,
      requesterId: currentUser.id,
      requesterName: `${currentUser.fullName} (${reqSource === 'HOSPITAL' ? 'Staf RS' : 'Keluarga'})`,
      requesterPhone: currentUser.phone,
      patientIdentifier: data.patientIdentifier,
      bloodType: data.bloodType,
      rhesus: data.rhesus,
      componentType: data.componentType,
      bagsNeeded: data.bagsNeeded,
      bagsFulfilled: 0,
      hospitalId: data.hospitalId,
      hospitalName: selectedHospital ? selectedHospital.name : 'Rumah Sakit Wilayah Cirebon',
      hospitalRoom: data.hospitalRoom,
      city: data.city,
      urgency: data.urgency,
      verificationStatus: reqSource === 'HOSPITAL' ? 'VERIFIED_BY_HOSPITAL' : 'UNVERIFIED',
      verificationProofUrl: data.proofFilename || 'Verifikasi langsung di loket BDRS',
      verificationNotes: reqSource === 'HOSPITAL' 
        ? `Diajukan dan tervalidasi langsung oleh staf BDRS: ${currentUser.fullName}` 
        : 'Menunggu peninjauan berkas oleh staf Rumah Sakit / BDRS.',
      status: 'OPEN',
      diagnosisNotes: data.diagnosisNotes || 'Transfusi darurat sesuai instruksi dokter spesialis.',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      duplicateDetected: dupCheck.isDuplicate,
      duplicateNotes: dupCheck.isDuplicate ? `Terdeteksi kesamaan pasien dengan permohonan #${dupCheck.existingRequest?.id}` : undefined,
      familyCompanions: companionRecord ? [companionRecord] : [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          requestId: reqId,
          type: 'CREATED',
          title: reqSource === 'HOSPITAL' ? 'Diajukan Resmi oleh Rumah Sakit' : 'Permohonan Dibuat oleh Keluarga Pasien',
          description: `Kebutuhan ${data.bagsNeeded} kantong ${data.componentType} (${data.bloodType}${data.rhesus === 'POSITIVE' ? '+' : '-'}) untuk ${data.patientIdentifier} di ${selectedHospital?.name || 'Faskes'}.${companionRecord ? ` Pendamping terdaftar: ${companionRecord.fullName} (${companionRecord.relationship}).` : ''}`,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          timestamp: new Date().toISOString()
        }
      ],
      receivedBagsLog: []
    };

    setRequests(prev => [newReq, ...prev]);
    addAudit('REQUEST_CREATED', 'BloodRequest', newReq.id, `Permohonan darah ${newReq.bloodType}${newReq.rhesus === 'POSITIVE' ? '+' : '-'} sebanyak ${newReq.bagsNeeded} kantong di ${newReq.hospitalName}. Sumber: ${reqSource}.`);
    
    // 1. Notification for requester (REQUESTER role)
    const newNotifs: NotificationItem[] = [
      {
        id: `notif-${Date.now()}-req`,
        userId: currentUser.id,
        recipientId: currentUser.id,
        recipientRole: 'REQUESTER',
        category: 'REQUESTER',
        sourceActivity: 'REQUEST_STATUS',
        targetEntityId: newReq.id,
        title: 'Permohonan Donor Berhasil Dipublikasikan',
        message: `ID Permohonan: #${newReq.id}. Sistem mulai memindai calon pendonor di wilayah ${newReq.city}.`,
        type: 'STATUS_CHANGE',
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];

    // 2. Notification for companion if registered
    if (companionRecord && companionRecord.matchedUserId) {
      newNotifs.push({
        id: `notif-${Date.now()}-comp`,
        userId: companionRecord.matchedUserId,
        recipientId: companionRecord.matchedUserId,
        recipientRole: 'REQUESTER',
        category: 'REQUESTER',
        sourceActivity: 'REQUEST_STATUS',
        targetEntityId: newReq.id,
        title: 'Anda Ditambahkan Sebagai Pendamping Pasien',
        message: `${currentUser.fullName} menambahkan Anda sebagai pendamping untuk pasien ${newReq.patientIdentifier} di ${newReq.hospitalName}.`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // 3. Notification for Hospital BDRS staff
    const hospitalStaff = allUsers.filter(u => u.role === 'HOSPITAL' && (u.facilityId === data.hospitalId || !u.facilityId));
    hospitalStaff.forEach((hStaff, idx) => {
      newNotifs.push({
        id: `notif-${Date.now()}-hosp-${idx}`,
        userId: hStaff.id,
        recipientId: hStaff.id,
        recipientRole: 'HOSPITAL',
        category: 'HOSPITAL',
        sourceActivity: 'NEW_REQUEST_SUBMITTED',
        targetEntityId: newReq.id,
        title: 'Permohonan Darah Baru Diterima',
        message: `Permohonan ${data.bagsNeeded} kantong ${data.componentType} (${data.bloodType}${data.rhesus === 'POSITIVE' ? '+' : '-'}) untuk ${data.patientIdentifier} di ${data.hospitalRoom}.`,
        type: 'VERIFICATION',
        priority: data.urgency === 'CRITICAL_24H' ? 'HIGH' : 'NORMAL',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    // 4. Notification for matching available donors in Cirebon
    const matchingDonors = allUsers.filter(u => {
      if (!u.isDonorEnabled && u.role !== 'DONOR') return false;
      const prof = donorProfiles[u.id];
      if (!prof) return false;
      if (prof.isAvailable === false) return false;
      return prof.bloodType === data.bloodType;
    });

    matchingDonors.slice(0, 5).forEach((donor, idx) => {
      newNotifs.push({
        id: `notif-${Date.now()}-donor-${idx}`,
        userId: donor.id,
        recipientId: donor.id,
        recipientRole: 'DONOR',
        category: 'DONOR',
        sourceActivity: 'MATCH_FOUND',
        targetEntityId: newReq.id,
        title: `Kebutuhan Darah Golongan ${data.bloodType}${data.rhesus === 'POSITIVE' ? '+' : '-'}`,
        message: `Pasien di ${newReq.hospitalName} membutuhkan ${data.bagsNeeded} kantong ${data.componentType}. Buka aplikasi untuk menyatakan kesediaan.`,
        type: 'MATCH',
        priority: data.urgency === 'CRITICAL_24H' ? 'HIGH' : 'NORMAL',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    setNotifications(prev => [...newNotifs, ...prev]);

    showToast({
      type: 'success',
      title: 'Permohonan Donor Berhasil Dibuat',
      message: `ID: #${newReq.id}. Calon pendonor yang cocok dan BDRS rumah sakit telah dinotifikasi.`
    });

    return newReq;
  };

  // Hospital Verifies Request
  const verifyRequestByHospital = (requestId: string, notes?: string) => {
    let targetReq: BloodRequest | undefined;
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      targetReq = req;
      const newTimeline: RequestTimelineEvent = {
        id: `tl-${Date.now()}`,
        requestId: req.id,
        type: 'VERIFIED',
        title: 'Diverifikasi Resmi oleh Staf Rumah Sakit',
        description: notes || `Dokumen transfusi divalidasi sah oleh BDRS ${currentUser.facilityName || 'Rumah Sakit'}.`,
        actorName: currentUser.fullName,
        actorRole: 'HOSPITAL',
        timestamp: new Date().toISOString()
      };
      return {
        ...req,
        verificationStatus: 'VERIFIED_BY_HOSPITAL',
        verificationNotes: notes || `Tervalidasi sah oleh BDRS ${currentUser.facilityName || 'Rumah Sakit'}.`,
        timeline: [...(req.timeline || []), newTimeline]
      };
    }));

    if (targetReq) {
      const verifiedNotifs: NotificationItem[] = [
        {
          id: `notif-${Date.now()}-ver-req`,
          userId: targetReq.requesterId,
          recipientId: targetReq.requesterId,
          recipientRole: 'REQUESTER',
          category: 'REQUESTER',
          sourceActivity: 'REQUEST_VERIFIED',
          targetEntityId: targetReq.id,
          title: 'Permohonan Terverifikasi BDRS',
          message: `Permohonan darah untuk ${targetReq.patientIdentifier} telah diverifikasi resmi oleh BDRS ${currentUser.facilityName || 'Rumah Sakit'}.`,
          type: 'VERIFICATION',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ];

      // Also notify active companions
      targetReq.familyCompanions?.filter(c => c.status === 'ACTIVE' && c.matchedUserId).forEach(c => {
        verifiedNotifs.push({
          id: `notif-${Date.now()}-ver-comp-${c.id}`,
          userId: c.matchedUserId!,
          recipientId: c.matchedUserId!,
          recipientRole: 'REQUESTER',
          category: 'REQUESTER',
          sourceActivity: 'REQUEST_VERIFIED',
          targetEntityId: targetReq!.id,
          title: 'Permohonan Terverifikasi BDRS',
          message: `Permohonan darah pasien ${targetReq!.patientIdentifier} telah diverifikasi resmi oleh BDRS ${currentUser.facilityName || 'Rumah Sakit'}.`,
          type: 'VERIFICATION',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });

      setNotifications(prev => [...verifiedNotifs, ...prev]);
    }

    addAudit('REQUEST_VERIFIED', 'BloodRequest', requestId, `Verifikasi berkas transfusi oleh ${currentUser.fullName} (${currentUser.facilityName}).`);
    showToast({
      type: 'success',
      title: 'Permintaan Terverifikasi',
      message: 'Status permintaan kini memiliki lencana Terverifikasi Rumah Sakit.'
    });
  };

  // Update Status & Progress
  const updateRequestStatus = (requestId: string, status: RequestStatus, bagsFulfilled?: number) => {
    let updatedReq: BloodRequest | undefined;
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      const updatedBags = bagsFulfilled !== undefined ? bagsFulfilled : req.bagsFulfilled;
      const isComplete = updatedBags >= req.bagsNeeded && status !== 'CANCELLED';
      const finalStatus = isComplete ? 'CLOSED_FULFILLED' : status;

      const timelineEvent: RequestTimelineEvent = {
        id: `tl-${Date.now()}`,
        requestId: req.id,
        type: isComplete ? 'COMPLETED' : status === 'CANCELLED' ? 'CANCELLED' : 'STATUS_UPDATED',
        title: isComplete ? 'Seluruh Kebutuhan Kantong Terpenuhi' : `Status Diperbarui: ${finalStatus}`,
        description: `Tercatat ${updatedBags} dari total ${req.bagsNeeded} kantong telah terpenuhi.`,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        timestamp: new Date().toISOString()
      };

      updatedReq = {
        ...req,
        status: finalStatus,
        bagsFulfilled: updatedBags,
        timeline: [...(req.timeline || []), timelineEvent]
      };
      return updatedReq;
    }));

    if (updatedReq) {
      const isComplete = updatedReq.bagsFulfilled >= updatedReq.bagsNeeded;
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: updatedReq.requesterId,
        title: isComplete ? 'Kebutuhan Kantong Darah Terpenuhi' : 'Pembaruan Progres Kantong Darah',
        message: isComplete 
          ? `Alhamdulillah, seluruh ${updatedReq.bagsNeeded} kantong darah untuk ${updatedReq.patientIdentifier} telah diterima lengkap di ${updatedReq.hospitalName}.`
          : `Progres kantong darah untuk ${updatedReq.patientIdentifier}: ${updatedReq.bagsFulfilled} dari ${updatedReq.bagsNeeded} kantong telah tercatat oleh faskes.`,
        type: 'STATUS_CHANGE',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addAudit('REQUEST_STATUS_UPDATED', 'BloodRequest', requestId, `Pembaruan status menjadi ${status} (${bagsFulfilled ?? 'tanpa perubahan'} kantong).`);
    showToast({
      type: 'info',
      title: 'Status Permintaan Diperbarui',
      message: `Status berhasil disimpan.`
    });
  };

  // Hospital Records Bag Receipt
  const recordBagReceipt = (requestId: string, bagData: { 
    bagSerialNumber: string; 
    componentType: ComponentType; 
    donorNameOrLab: string; 
    bloodType: BloodType; 
    rhesus: Rhesus; 
    labNotes?: string 
  }) => {
    const newBag: ReceivedBagLog = {
      id: `bag-${Date.now()}`,
      requestId,
      bagSerialNumber: bagData.bagSerialNumber,
      componentType: bagData.componentType,
      donorNameOrLab: bagData.donorNameOrLab,
      bloodType: bagData.bloodType,
      rhesus: bagData.rhesus,
      verifiedBy: currentUser.fullName,
      labNotes: bagData.labNotes || 'Lolos uji skrining IMLTD & crossmatch serasi BDRS',
      receivedAt: new Date().toISOString()
    };

    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      const newBagsCount = req.bagsFulfilled + 1;
      const isComplete = newBagsCount >= req.bagsNeeded;
      const newTimeline: RequestTimelineEvent = {
        id: `tl-${Date.now()}`,
        requestId,
        type: 'BAG_RECEIVED',
        title: `Kantong Darah Diterima (#${bagData.bagSerialNumber})`,
        description: `Kantong ${bagData.componentType} dari relawan ${bagData.donorNameOrLab} dinyatakan lolos skrining lab oleh ${currentUser.fullName}.`,
        actorName: currentUser.fullName,
        actorRole: 'HOSPITAL',
        timestamp: new Date().toISOString()
      };

      return {
        ...req,
        bagsFulfilled: newBagsCount,
        status: isComplete ? 'CLOSED_FULFILLED' : 'PARTIALLY_FULFILLED',
        receivedBagsLog: [...(req.receivedBagsLog || []), newBag],
        timeline: [...(req.timeline || []), newTimeline]
      };
    }));

    addAudit('BAG_RECEIVED', 'BloodRequest', requestId, `Kantong darah #${bagData.bagSerialNumber} diterima dan diverifikasi oleh ${currentUser.fullName}.`);
    showToast({
      type: 'success',
      title: 'Kantong Darah Berhasil Dicatat',
      message: `Kantong #${bagData.bagSerialNumber} telah ditambahkan ke progres transfusi pasien.`
    });
  };

  // Donor Responses
  const addDonorResponse = (requestId: string, etaDescription: string, notes?: string) => {
    if (!currentUser.isDonorEnabled && currentUser.role !== 'DONOR') {
      showToast({ type: 'error', title: 'Fitur Belum Aktif', message: 'Aktifkan fitur Pendonor Sukarela pada profil Anda untuk menyatakan kesediaan donor.' });
      return;
    }

    const currentProfile = donorProfiles[currentUser.id];
    const newResponse: DonorResponse = {
      id: `resp-${Date.now().toString(36)}`,
      requestId,
      donorId: currentUser.id,
      donorName: currentUser.fullName,
      donorBloodType: currentProfile ? currentProfile.bloodType : 'UNKNOWN',
      donorRhesus: currentProfile ? currentProfile.rhesus : 'UNKNOWN',
      donorPhone: currentUser.phone,
      responseStatus: 'COMMITTED',
      etaDescription,
      notes,
      createdAt: new Date().toISOString()
    };

    setResponses(prev => [newResponse, ...prev]);
    
    const targetReq = requests.find(r => r.id === requestId);
    if (targetReq) {
      const timelineEvent: RequestTimelineEvent = {
        id: `tl-${Date.now()}`,
        requestId: targetReq.id,
        type: 'DONOR_COMMITTED',
        title: 'Relawan Menyatakan Komitmen Hadir',
        description: `${currentUser.fullName} (${currentProfile?.bloodType || 'Donor'}) menyatakan bersedia hadir (Estimasi: ${etaDescription}).`,
        actorName: currentUser.fullName,
        actorRole: 'DONOR',
        timestamp: new Date().toISOString()
      };

      setRequests(prev => prev.map(r => {
        if (r.id === requestId) {
          const nextStatus = r.status === 'OPEN' ? 'PARTIALLY_FULFILLED' : r.status;
          return {
            ...r,
            status: nextStatus,
            timeline: [...(r.timeline || []), timelineEvent]
          };
        }
        return r;
      }));

      // Automatically initialize Chat Thread between this Donor and the Requester
      getOrCreateChatThread(targetReq.id, currentUser.id);

      // Notifications
      const notifRequester: NotificationItem = {
        id: `notif-${Date.now()}-req`,
        userId: targetReq.requesterId,
        title: 'Relawan Menanggapi Permohonan',
        message: `${currentUser.fullName} menyatakan bersedia donor untuk ${targetReq.patientIdentifier} di ${targetReq.hospitalName} (Estimasi: ${etaDescription}). Buka tab Chat untuk berkoordinasi.`,
        type: 'MATCH',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const notifDonor: NotificationItem = {
        id: `notif-${Date.now()}-don`,
        userId: currentUser.id,
        title: 'Komitmen Donor Tercatat',
        message: `Terima kasih! Komitmen Anda untuk ${targetReq.hospitalName} telah diteruskan. Anda dapat berkomunikasi via fitur Chat di aplikasi.`,
        type: 'STATUS_CHANGE',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      setNotifications(prev => [notifRequester, notifDonor, ...prev]);
    }

    addAudit('DONOR_COMMITTED', 'DonorResponse', newResponse.id, `Pendonor ${currentUser.fullName} bersedia hadir di Faskes (${etaDescription}).`);

    showToast({
      type: 'success',
      title: 'Terima Kasih atas Kesediaan Anda!',
      message: 'Komitmen kehadiran telah dicatat. Silakan gunakan fitur Chat internal untuk koordinasi aman.'
    });
  };

  const cancelDonorResponse = (responseId: string) => {
    setResponses(prev => prev.filter(r => r.id !== responseId));
    addAudit('DONOR_RESPONSE_CANCELLED', 'DonorResponse', responseId, `Pendonor membatalkan komitmen kehadiran.`);
    showToast({
      type: 'info',
      title: 'Komitmen Dibatalkan',
      message: 'Komitmen donor telah ditarik dari sistem.'
    });
  };

  // Facility Actions
  const verifyFacility = (facilityId: string) => {
    if (currentUser.role !== 'ADMIN') return;
    const fac = facilities.find(f => f.id === facilityId);
    setFacilities(prev => prev.map(f => {
      if (f.id !== facilityId) return f;
      return { ...f, isVerified: true };
    }));
    setAllUsers(prev => prev.map(u => {
      if (u.facilityId === facilityId) {
        return { ...u, status: 'ACTIVE' };
      }
      return u;
    }));
    addAudit('FACILITY_VERIFIED', 'HealthcareFacility', facilityId, `Fasilitas kesehatan ${fac?.name || facilityId} disetujui & diverifikasi resmi oleh Administrator.`);
    showToast({
      type: 'success',
      title: 'Fasilitas Kesehatan Terverifikasi',
      message: `Faskes ${fac?.name || ''} kini berstatus resmi terdaftar dan akun faskes telah aktif.`
    });
  };

  const rejectFacility = (facilityId: string, reason?: string) => {
    if (currentUser.role !== 'ADMIN') return;
    const fac = facilities.find(f => f.id === facilityId);
    setFacilities(prev => prev.filter(f => f.id !== facilityId));
    setAllUsers(prev => prev.map(u => {
      if (u.facilityId === facilityId) {
        return { ...u, status: 'SUSPENDED' };
      }
      return u;
    }));
    addAudit('FACILITY_REJECTED', 'HealthcareFacility', facilityId, `Pengajuan faskes ${fac?.name || facilityId} ditolak oleh Administrator: ${reason || 'Dokumen izin operasional tidak valid'}.`);
    showToast({
      type: 'warning',
      title: 'Pengajuan Faskes Ditolak',
      message: `Fasilitas ${fac?.name || ''} telah ditolak dan akun dinonaktifkan.`
    });
  };

  // ============================================
  // PMI/UTD BLOOD STOCK MANAGEMENT
  // ============================================
  const addOrUpdateStock = (data: { 
    facilityId: string; 
    bloodType: BloodType; 
    rhesus: Rhesus; 
    componentType: ComponentType; 
    unitsChange: number; 
    type: 'ADD_STOCK' | 'ADJUSTMENT'; 
    notes?: string 
  }) => {
    const facility = facilities.find(f => f.id === data.facilityId) || facilities[0];
    const itemKey = `${data.facilityId}-${data.bloodType}-${data.rhesus}-${data.componentType}`;

    setStockItems(prev => {
      const existing = prev.find(i => 
        i.facilityId === data.facilityId && 
        i.bloodType === data.bloodType && 
        i.rhesus === data.rhesus && 
        i.componentType === data.componentType
      );

      if (existing) {
        return prev.map(item => {
          if (item.id === existing.id) {
            return {
              ...item,
              unitsAvailable: Math.max(0, item.unitsAvailable + data.unitsChange),
              lastUpdated: new Date().toISOString()
            };
          }
          return item;
        });
      } else {
        const newItem: BloodStockItem = {
          id: `stock-${itemKey}`,
          facilityId: data.facilityId,
          facilityName: facility.name,
          bloodType: data.bloodType,
          rhesus: data.rhesus,
          componentType: data.componentType,
          unitsAvailable: Math.max(0, data.unitsChange),
          unitsQuarantine: 0,
          unitsReserved: 0,
          minThreshold: 10,
          isPublishedToPublic: true,
          lastUpdated: new Date().toISOString()
        };
        return [...prev, newItem];
      }
    });

    const newTx: StockTransaction = {
      id: `stx-${Date.now()}`,
      facilityId: data.facilityId,
      type: data.type,
      bloodType: data.bloodType,
      rhesus: data.rhesus,
      componentType: data.componentType,
      units: data.unitsChange,
      notes: data.notes || 'Penyesuaian stok berkala UTD',
      staffName: currentUser.fullName,
      timestamp: new Date().toISOString()
    };
    setStockTransactions(prev => [newTx, ...prev]);

    addAudit('STOCK_UPDATED', 'BloodStockItem', itemKey, `Pembaruan stok ${data.bloodType}${data.rhesus === 'POSITIVE' ? '+' : '-'} (${data.unitsChange > 0 ? '+' : ''}${data.unitsChange} kantong).`);

    showToast({
      type: 'success',
      title: 'Stok Berhasil Diperbarui',
      message: `${Math.abs(data.unitsChange)} kantong ${data.componentType} ${data.bloodType} telah dicatat dalam inventaris.`
    });
  };

  const allocateStock = (data: { stockId: string; units: number; hospitalName: string; notes?: string }) => {
    let targetItem: BloodStockItem | undefined;
    setStockItems(prev => prev.map(item => {
      if (item.id !== data.stockId) return item;
      targetItem = item;
      const newAvail = Math.max(0, item.unitsAvailable - data.units);
      const newReserved = item.unitsReserved + data.units;
      return {
        ...item,
        unitsAvailable: newAvail,
        unitsReserved: newReserved,
        lastUpdated: new Date().toISOString()
      };
    }));

    if (targetItem) {
      const newTx: StockTransaction = {
        id: `stx-${Date.now()}`,
        facilityId: targetItem.facilityId,
        type: 'ALLOCATE',
        bloodType: targetItem.bloodType,
        rhesus: targetItem.rhesus,
        componentType: targetItem.componentType,
        units: data.units,
        recipientHospitalOrPatient: data.hospitalName,
        notes: data.notes || `Dialokasikan untuk ${data.hospitalName}`,
        staffName: currentUser.fullName,
        timestamp: new Date().toISOString()
      };
      setStockTransactions(prev => [newTx, ...prev]);
    }

    showToast({
      type: 'info',
      title: 'Alokasi Berhasil Dicatat',
      message: `${data.units} kantong darah telah direservasi untuk ${data.hospitalName}.`
    });
  };

  const handoverStock = (data: { stockId: string; units: number; recipientName: string; batchNumber?: string; notes?: string }) => {
    let targetItem: BloodStockItem | undefined;
    setStockItems(prev => prev.map(item => {
      if (item.id !== data.stockId) return item;
      targetItem = item;
      const newReserved = Math.max(0, item.unitsReserved - data.units);
      return {
        ...item,
        unitsReserved: newReserved,
        lastUpdated: new Date().toISOString()
      };
    }));

    if (targetItem) {
      const newTx: StockTransaction = {
        id: `stx-${Date.now()}`,
        facilityId: targetItem.facilityId,
        type: 'HANDOVER',
        bloodType: targetItem.bloodType,
        rhesus: targetItem.rhesus,
        componentType: targetItem.componentType,
        units: data.units,
        batchOrBagNumber: data.batchNumber || `BAG-UTD-${Math.floor(1000 + Math.random() * 9000)}`,
        recipientHospitalOrPatient: data.recipientName,
        notes: data.notes || `Penyerahan resmi kepada ${data.recipientName}`,
        staffName: currentUser.fullName,
        timestamp: new Date().toISOString()
      };
      setStockTransactions(prev => [newTx, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Penyerahan Darah Selesai',
      message: `${data.units} kantong darah telah diserahkan secara resmi.`
    });
  };

  // ============================================
  // VOLUNTARY DONOR BOOKING & QUEUE
  // ============================================
  const createDonorBooking = (data: { facilityId: string; bookingDate: string; timeSlot: DonorBooking['timeSlot'] }): DonorBooking => {
    const facility = facilities.find(f => f.id === data.facilityId) || facilities[0];
    const currentProfile = donorProfiles[currentUser.id];
    const randomTicket = Math.floor(1 + Math.random() * 30);
    const queueNumber = `A-${randomTicket < 10 ? '0' : ''}${randomTicket}`;

    const newBooking: DonorBooking = {
      id: `BOOK-CRB-${Math.floor(2000 + Math.random() * 1000)}`,
      donorId: currentUser.id,
      donorName: currentUser.fullName,
      donorPhone: currentUser.phone,
      donorBloodType: currentProfile ? currentProfile.bloodType : 'UNKNOWN',
      donorRhesus: currentProfile ? currentProfile.rhesus : 'UNKNOWN',
      facilityId: data.facilityId,
      facilityName: facility.name,
      bookingDate: data.bookingDate,
      timeSlot: data.timeSlot,
      queueNumber,
      status: 'BOOKED',
      createdAt: new Date().toISOString()
    };

    setDonorBookings(prev => [newBooking, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Tiket Booking Donor Sukarela Diterbitkan',
      message: `Nomor Antrean Anda: ${queueNumber} di ${facility.name} untuk tanggal ${data.bookingDate} (${data.timeSlot}).`,
      type: 'BOOKING',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    showToast({
      type: 'success',
      title: 'Booking Donor Sukarela Berhasil',
      message: `Tiket antrean ${queueNumber} siap. Harap datang 15 menit sebelum slot waktu.`
    });

    return newBooking;
  };

  const checkInBooking = (bookingId: string) => {
    setDonorBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return { ...b, status: 'CHECKED_IN' };
    }));

    showToast({
      type: 'success',
      title: 'Check-In Berhasil',
      message: 'Pendonor telah berada di ruang tunggu UTD PMI dan siap dipanggil skrining fisik.'
    });
  };

  const updateBookingScreening = (bookingId: string, screening: { hbLevel: number; bloodPressure: string; weightKg: number; passed: boolean; notes?: string }) => {
    setDonorBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        status: screening.passed ? 'SCREENING_PASSED' : 'SCREENING_FAILED',
        screeningData: {
          hbLevel: screening.hbLevel,
          bloodPressure: screening.bloodPressure,
          weightKg: screening.weightKg,
          screeningNotes: screening.notes || (screening.passed ? 'Memenuhi syarat fisik untuk pengambilan darah.' : 'Kadar Hb/Tensi belum memenuhi syarat donor hari ini.')
        }
      };
    }));

    showToast({
      type: screening.passed ? 'success' : 'warning',
      title: screening.passed ? 'Lolos Skrining Medis' : 'Skrining Belum Memenuhi Syarat',
      message: screening.passed 
        ? 'Pendonor diarahkan ke bilik pengambilan darah (Aftap).' 
        : 'Pendonor disarankan istirahat dan cek kembali beberapa hari ke depan.'
    });
  };

  // Release Blood Bag from Quarantine to Available
  const releaseBloodBag = (bagId: string, notes?: string) => {
    let releasedBag: BloodBagItem | undefined;
    setBloodBags(prev => prev.map(bag => {
      if (bag.id !== bagId) return bag;
      releasedBag = {
        ...bag,
        status: 'AVAILABLE',
        imltdScreening: {
          hiv: 'NON_REACTIVE',
          hepatitisB: 'NON_REACTIVE',
          hepatitisC: 'NON_REACTIVE',
          syphilis: 'NON_REACTIVE',
          isReleased: true,
          authorizedByStaff: currentUser.fullName,
          authorizedAt: new Date().toISOString(),
          releaseNotes: notes || 'Otorisasi pelepasan resmi: 4 parameter non-reaktif'
        },
        lastUpdated: new Date().toISOString()
      };
      return releasedBag;
    }));

    if (releasedBag) {
      const bagObj = releasedBag as BloodBagItem;
      // Update aggregated stock: -1 quarantine, +1 available
      setStockItems(prev => prev.map(item => {
        if (
          item.facilityId === bagObj.facilityId &&
          item.bloodType === bagObj.bloodType &&
          item.rhesus === bagObj.rhesus &&
          item.componentType === bagObj.componentType
        ) {
          return {
            ...item,
            unitsAvailable: item.unitsAvailable + 1,
            unitsQuarantine: Math.max(0, item.unitsQuarantine - 1),
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      }));

      // Add audit & transaction
      const newTx: StockTransaction = {
        id: `stx-${Date.now()}`,
        facilityId: bagObj.facilityId,
        type: 'RELEASE_FROM_QUARANTINE',
        bloodType: bagObj.bloodType,
        rhesus: bagObj.rhesus,
        componentType: bagObj.componentType,
        units: 1,
        batchOrBagNumber: bagObj.bagSerialNumber,
        notes: `Pelepasan resmi dari karantina lab IMLTD oleh ${currentUser.fullName}`,
        staffName: currentUser.fullName,
        timestamp: new Date().toISOString()
      };
      setStockTransactions(prev => [newTx, ...prev]);

      addAudit('BLOOD_BAG_RELEASED', 'BloodBagItem', bagObj.id, `Kantong ${bagObj.bagSerialNumber} diotorisasi rilis ke stok tersedia.`);

      showToast({
        type: 'success',
        title: 'Kantong Darah Resmi Dirilis',
        message: `Kantong #${bagObj.bagSerialNumber} (${bagObj.bloodType}${bagObj.rhesus === 'POSITIVE' ? '+' : '-'}) lolos skrining IMLTD dan masuk ke stok siap pakai.`
      });
    }
  };

  // Discard Blood Bag (Defective / Reactive / Expired)
  const discardBloodBag = (bagId: string, reason: string) => {
    let discardedBag: BloodBagItem | undefined;
    setBloodBags(prev => prev.map(bag => {
      if (bag.id !== bagId) return bag;
      discardedBag = {
        ...bag,
        status: 'DISCARDED_DEFECTIVE',
        lastUpdated: new Date().toISOString()
      };
      return discardedBag;
    }));

    if (discardedBag) {
      const bagObj = discardedBag as BloodBagItem;
      setStockItems(prev => prev.map(item => {
        if (
          item.facilityId === bagObj.facilityId &&
          item.bloodType === bagObj.bloodType &&
          item.rhesus === bagObj.rhesus &&
          item.componentType === bagObj.componentType
        ) {
          const wasQuarantine = bagObj.status === 'QUARANTINE_TESTING';
          return {
            ...item,
            unitsQuarantine: wasQuarantine ? Math.max(0, item.unitsQuarantine - 1) : item.unitsQuarantine,
            unitsAvailable: !wasQuarantine ? Math.max(0, item.unitsAvailable - 1) : item.unitsAvailable,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      }));

      const newTx: StockTransaction = {
        id: `stx-${Date.now()}`,
        facilityId: bagObj.facilityId,
        type: 'DISCARD',
        bloodType: bagObj.bloodType,
        rhesus: bagObj.rhesus,
        componentType: bagObj.componentType,
        units: 1,
        batchOrBagNumber: bagObj.bagSerialNumber,
        notes: `Ditarik / dimusnahkan: ${reason}`,
        staffName: currentUser.fullName,
        timestamp: new Date().toISOString()
      };
      setStockTransactions(prev => [newTx, ...prev]);

      addAudit('BLOOD_BAG_DISCARDED', 'BloodBagItem', bagObj.id, `Kantong ${bagObj.bagSerialNumber} ditarik: ${reason}`);

      showToast({
        type: 'warning',
        title: 'Kantong Darah Ditarik',
        message: `Kantong #${bagObj.bagSerialNumber} telah dikeluarkan dari peredaran.`
      });
    }
  };

  const completeDonorBooking = (bookingId: string, notes?: string) => {
    let completedBooking: DonorBooking | undefined;
    setDonorBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      completedBooking = b;
      return {
        ...b,
        status: 'DONATION_COMPLETED',
        completionNotes: notes || '1 kantong darah Whole Blood 350ml berhasil diambil dengan aman.'
      };
    }));

    if (completedBooking) {
      const cBooking = completedBooking as DonorBooking;
      // Update donor profile total donations & last donation date
      const donorId = cBooking.donorId;
      setDonorProfiles(prev => {
        const cur = prev[donorId];
        if (!cur) return prev;
        return {
          ...prev,
          [donorId]: {
            ...cur,
            totalDonations: cur.totalDonations + 1,
            lastDonationDate: new Date().toISOString().split('T')[0],
            isAvailable: false // automatically enter 60-day resting interval
          }
        };
      });

      // Generate a new blood bag with status QUARANTINE_TESTING (IMLTD tests pending)
      // This strictly follows the protocol: finished donation enters quarantine first!
      const newBagSerial = `CRB-WB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBloodBag: BloodBagItem = {
        id: `bag-${Date.now()}`,
        bagSerialNumber: newBagSerial,
        facilityId: cBooking.facilityId,
        facilityName: cBooking.facilityName,
        bloodType: cBooking.donorBloodType,
        rhesus: cBooking.donorRhesus,
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
          releaseNotes: 'Sampel sedang dalam antrean pengujian laboratorium IMLTD'
        },
        donorId: cBooking.donorId,
        donorName: cBooking.donorName,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      setBloodBags(prev => [newBloodBag, ...prev]);

      // Add to Quarantine Stock (NOT available yet!)
      setStockItems(prev => prev.map(item => {
        if (
          item.facilityId === cBooking.facilityId &&
          item.bloodType === cBooking.donorBloodType &&
          item.rhesus === cBooking.donorRhesus &&
          item.componentType === 'WHOLE_BLOOD'
        ) {
          return {
            ...item,
            unitsQuarantine: item.unitsQuarantine + 1,
            lastUpdated: new Date().toISOString()
          };
        }
        return item;
      }));

      // Record transaction
      const newTx: StockTransaction = {
        id: `stx-${Date.now()}`,
        facilityId: cBooking.facilityId,
        type: 'ADD_STOCK',
        bloodType: cBooking.donorBloodType,
        rhesus: cBooking.donorRhesus,
        componentType: 'WHOLE_BLOOD',
        units: 1,
        batchOrBagNumber: newBagSerial,
        notes: `Hasil donor sukarela #${cBooking.id} (${cBooking.donorName}) - Masuk Karantina Lab IMLTD`,
        staffName: currentUser.fullName,
        timestamp: new Date().toISOString()
      };
      setStockTransactions(prev => [newTx, ...prev]);

      // Notification
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: cBooking.donorId,
        title: 'Terima Kasih! Donor Darah Anda Berhasil',
        message: `Satu kantong darah Anda (${newBagSerial}) telah tercatat di ${cBooking.facilityName} dan sedang dalam proses pengolahan & uji saring laboratorium. Kartu donor digital Anda telah diperbarui.`,
        type: 'STATUS_CHANGE',
        category: 'BOOKING',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast({
      type: 'success',
      title: 'Donor Berhasil Dicatat!',
      message: 'Darah berhasil diambil dan masuk ke bilik karantina laboratorium UTD untuk uji saring IMLTD.'
    });
  };

  const cancelDonorBooking = (bookingId: string) => {
    setDonorBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return { ...b, status: 'CANCELLED' };
    }));

    showToast({
      type: 'info',
      title: 'Booking Dibatalkan',
      message: 'Jadwal antrean donor sukarela telah dinonaktifkan dan kuota sesi dikembalikan.'
    });
  };

  // Reschedule Donor Booking
  const rescheduleDonorBooking = (bookingId: string, newDate: string, newTimeSlot: DonorBooking['timeSlot']): DonorBooking => {
    let oldBooking: DonorBooking | undefined;
    setDonorBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      oldBooking = b;
      return {
        ...b,
        status: 'RESCHEDULED'
      };
    }));

    const facility = facilities.find(f => f.id === oldBooking?.facilityId) || facilities[0];
    const currentProfile = donorProfiles[currentUser.id];
    const randomTicket = Math.floor(1 + Math.random() * 30);
    const newQueueNumber = `B-${randomTicket < 10 ? '0' : ''}${randomTicket}`;

    const newBooking: DonorBooking = {
      id: `BOOK-CRB-${Math.floor(3000 + Math.random() * 1000)}`,
      donorId: currentUser.id,
      donorName: currentUser.fullName,
      donorPhone: currentUser.phone,
      donorBloodType: currentProfile ? currentProfile.bloodType : 'UNKNOWN',
      donorRhesus: currentProfile ? currentProfile.rhesus : 'UNKNOWN',
      facilityId: facility.id,
      facilityName: facility.name,
      bookingDate: newDate,
      timeSlot: newTimeSlot,
      queueNumber: newQueueNumber,
      status: 'BOOKED',
      rescheduledFromId: bookingId,
      rescheduledCount: (oldBooking?.rescheduledCount || 0) + 1,
      createdAt: new Date().toISOString()
    };

    setDonorBookings(prev => [newBooking, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Jadwal Donor Berhasil Diubah (Reschedule)',
      message: `Tiket antrean lama telah dinonaktifkan. Nomor antrean baru Anda: ${newQueueNumber} pada ${newDate} (${newTimeSlot}) di ${facility.name}.`,
      type: 'BOOKING',
      category: 'BOOKING',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    showToast({
      type: 'success',
      title: 'Penjadwalan Ulang Berhasil',
      message: `Nomor antrean baru Anda: ${newQueueNumber} untuk tanggal ${newDate}.`
    });

    return newBooking;
  };

  const callNextQueue = (customNumber?: string) => {
    const next = customNumber || `A-0${Math.floor(1 + Math.random() * 9)}`;
    setCurrentCallingQueue(next);
    showToast({
      type: 'info',
      title: `Memanggil Antrean: ${next}`,
      message: 'Silakan nomor antrean menuju loket skrining UTD PMI.'
    });
    return next;
  };

  // ============================================
  // IN-APP CHAT (DONOR & REQUESTER)
  // ============================================
  const getOrCreateChatThread = (requestId: string, donorId: string): string => {
    const existing = chatThreads.find(t => t.requestId === requestId && t.donorId === donorId);
    if (existing) {
      return existing.id;
    }

    const req = requests.find(r => r.id === requestId);
    const donorUser = allUsers.find(u => u.id === donorId) || currentUser;
    const donorProf = donorProfiles[donorId];

    const threadId = `thread-${requestId}-${donorId}`;
    const newThread: ChatThread = {
      id: threadId,
      requestId,
      patientIdentifier: req ? req.patientIdentifier : 'Pasien Cirebon',
      hospitalName: req ? req.hospitalName : 'Rumah Sakit',
      requesterId: req ? req.requesterId : currentUser.id,
      requesterName: req ? req.requesterName : 'Keluarga Pasien',
      donorId,
      donorName: donorUser.fullName,
      donorBloodType: donorProf ? donorProf.bloodType : 'UNKNOWN',
      donorRhesus: donorProf ? donorProf.rhesus : 'UNKNOWN',
      isDonorPhoneShared: false,
      isRequesterPhoneShared: false,
      donorPhone: donorUser.phone,
      requesterPhone: req ? req.requesterPhone : '',
      lastMessageText: 'Percakapan koordinasi donor dimulai.',
      lastMessageTimestamp: new Date().toISOString(),
      isArchived: false,
      createdAt: new Date().toISOString()
    };

    setChatThreads(prev => [newThread, ...prev]);

    // Initial system greeting message
    const initMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: 'system',
      senderName: 'Sistem DONORLINK',
      senderRole: 'ADMIN',
      text: `Ruang koordinasi resmi untuk permohonan #${requestId}. Lindungi privasi Anda: nomor kontak disamarkan sampai Anda menekan persetujuan berbagi. Dilarang bertransaksi komersial.`,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    setChatMessages(prev => [initMsg, ...prev]);

    return threadId;
  };

  const sendMessage = (threadId: string, text: string, isQuickReply?: boolean) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      threadId,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isQuickReply: Boolean(isQuickReply),
      isRead: false
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Update thread snippet
    setChatThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      return {
        ...t,
        lastMessageText: text.trim(),
        lastMessageTimestamp: new Date().toISOString()
      };
    }));

    // Trigger notification to the counterparty
    const targetThread = chatThreads.find(t => t.id === threadId);
    if (targetThread) {
      const recipientId = currentUser.id === targetThread.requesterId 
        ? targetThread.donorId 
        : targetThread.requesterId;

      const notif: NotificationItem = {
        id: `notif-${Date.now()}-chat`,
        userId: recipientId,
        title: `Pesan Baru dari ${currentUser.fullName}`,
        message: text.trim().slice(0, 100),
        type: 'CHAT',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const toggleWhatsAppShare = (threadId: string) => {
    setChatThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      const isRequester = currentUser.id === t.requesterId;
      const newStatus = isRequester ? !t.isRequesterPhoneShared : !t.isDonorPhoneShared;

      // Add a chat announcement
      const shareMsg: ChatMessage = {
        id: `msg-share-${Date.now()}`,
        threadId,
        senderId: 'system',
        senderName: 'Sistem DONORLINK',
        senderRole: 'ADMIN',
        text: `${currentUser.fullName} (${currentUser.role === 'DONOR' ? 'Pendonor' : 'Keluarga'}) telah ${newStatus ? 'MEMBAGIKAN' : 'MENARIK'} nomor WhatsApp resminya untuk kemudahan koordinasi di lokasi.`,
        timestamp: new Date().toISOString(),
        isRead: true
      };
      setChatMessages(messages => [...messages, shareMsg]);

      return {
        ...t,
        isRequesterPhoneShared: isRequester ? newStatus : t.isRequesterPhoneShared,
        isDonorPhoneShared: isRequester ? t.isDonorPhoneShared : newStatus
      };
    }));

    showToast({
      type: 'info',
      title: 'Persetujuan WhatsApp Diperbarui',
      message: 'Nomor WhatsApp Anda kini telah dapat dilihat oleh lawan bicara dalam thread ini.'
    });
  };

  const archiveChatThread = (threadId: string) => {
    setChatThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      return { ...t, isArchived: !t.isArchived };
    }));
    showToast({
      type: 'info',
      title: 'Thread Percakapan',
      message: 'Status arsip percakapan diperbarui.'
    });
  };

  // ============================================
  // FAMILY COMPANION
  // ============================================
  const addFamilyCompanion = (
    requestId: string,
    companion: {
      fullName: string;
      phone: string;
      relationship: string;
      permissions: ('VIEW' | 'CHAT' | 'CONFIRM')[];
      email?: string;
      consentGiven?: boolean;
    }
  ) => {
    const companionPhoneClean = companion.phone.replace(/[^0-9]/g, '');
    const matchedUser = allUsers.find(u => {
      const uPhoneClean = u.phone.replace(/[^0-9]/g, '');
      if (companionPhoneClean && uPhoneClean === companionPhoneClean) return true;
      if (companion.email && u.email && u.email.toLowerCase() === companion.email.toLowerCase()) return true;
      return false;
    });

    const newComp: FamilyCompanion = {
      id: `comp-${Date.now()}`,
      requestId,
      fullName: companion.fullName.trim(),
      phone: companion.phone.trim(),
      relationship: companion.relationship,
      permissions: companion.permissions.length > 0 ? companion.permissions : ['VIEW', 'CHAT'],
      email: companion.email?.trim() || undefined,
      status: matchedUser ? 'ACTIVE' : 'INVITED_PENDING_REGISTRATION',
      matchedUserId: matchedUser?.id,
      consentGiven: companion.consentGiven ?? true,
      invitationNotes: matchedUser 
        ? `Akun terdaftar terhubung (${matchedUser.fullName})` 
        : 'Undangan pendamping dikirim via WhatsApp. Akses aktif otomatis saat pengguna mendaftar.',
      addedAt: new Date().toISOString()
    };

    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        familyCompanions: [...(r.familyCompanions || []), newComp]
      };
    }));

    if (matchedUser) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}-comp-add`,
        userId: matchedUser.id,
        recipientId: matchedUser.id,
        recipientRole: matchedUser.role,
        category: 'REQUESTER',
        sourceActivity: 'REQUEST_STATUS',
        targetEntityId: requestId,
        title: 'Anda Ditambahkan Sebagai Pendamping Pasien',
        message: `${currentUser.fullName} menambahkan Anda sebagai pendamping permohonan darah pasien #${requestId}.`,
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }

    addAudit('COMPANION_ADDED', 'FamilyCompanion', newComp.id, `Pendamping keluarga ditambahkan: ${companion.fullName} (${companion.relationship}). Status: ${newComp.status}.`);
    showToast({
      type: 'success',
      title: 'Pendamping Keluarga Ditambahkan',
      message: `${companion.fullName} berhasil ditambahkan (${newComp.status === 'ACTIVE' ? 'Akun Terhubung' : 'Menunggu Pendaftaran'}).`
    });
  };

  const removeFamilyCompanion = (requestId: string, companionId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        familyCompanions: (r.familyCompanions || []).filter(c => c.id !== companionId)
      };
    }));

    showToast({
      type: 'info',
      title: 'Akses Pendamping Dihapus',
      message: 'Data pendamping telah dihapus dari permohonan.'
    });
  };

  const revokeFamilyCompanion = (requestId: string, companionId: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        familyCompanions: (r.familyCompanions || []).map(c => 
          c.id === companionId ? { ...c, status: 'REVOKED' as const } : c
        )
      };
    }));

    addAudit('COMPANION_REVOKED', 'FamilyCompanion', companionId, `Hak akses pendamping keluarga dicabut oleh pemohon.`);
    showToast({
      type: 'warning',
      title: 'Akses Pendamping Dicabut',
      message: 'Status hak akses pendamping telah diubah menjadi REVOKED.'
    });
  };

  // User Privacy & Data Consent Handlers
  const updatePrivacySettings = (settings: Partial<UserPrivacySettings>) => {
    setPrivacySettings(prev => ({
      ...prev,
      ...settings,
      notificationPreferences: {
        ...prev.notificationPreferences,
        ...(settings.notificationPreferences || {})
      }
    }));

    showToast({
      type: 'success',
      title: 'Pengaturan Privasi Disimpan',
      message: 'Preferensi penggunaan data dan izin kontak berhasil diperbarui.'
    });
  };

  const logSensitiveDataAccess = (accessedByName: string, accessedByRole: UserRole, purpose: string) => {
    const newRecord: SensitiveDataAccessRecord = {
      id: `sec-${Date.now()}`,
      accessedAt: new Date().toISOString(),
      accessedByName,
      accessedByRole,
      purpose
    };

    setPrivacySettings(prev => ({
      ...prev,
      sensitiveDataAccessLog: [newRecord, ...(prev.sensitiveDataAccessLog || [])]
    }));
  };

  // Abuse Reports Actions
  const createAbuseReport = (report: { 
    requestId?: string; 
    targetTitle: string; 
    reason: AbuseReport['reason']; 
    description: string;
    evidenceNotes?: string;
  }) => {
    const ticketSeq = abuseReports.length + 1;
    const ticketNumber = `TIK-CRB-2026-00${ticketSeq}`;
    const newReport: AbuseReport = {
      id: `rep-${Date.now().toString(36)}`,
      ticketNumber,
      reporterId: currentUser.id,
      reporterName: currentUser.fullName,
      requestId: report.requestId,
      targetPatientOrTitle: report.targetTitle,
      reason: report.reason,
      description: report.description,
      evidenceNotes: report.evidenceNotes,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    setAbuseReports(prev => [newReport, ...prev]);
    addAudit('ABUSE_REPORTED', 'AbuseReport', newReport.id, `Laporan tiket #${ticketNumber} indikasi penyalahgunaan: ${report.reason}.`);

    // Notification to user
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: `Laporan Tiket #${ticketNumber} Berhasil Dikirim`,
      message: `Laporan Anda telah tercatat dengan nomor tiket ${ticketNumber} dan akan ditinjau oleh tim Administrator DONORLINK.`,
      type: 'SYSTEM',
      category: 'REPORT',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);

    showToast({
      type: 'warning',
      title: 'Laporan Diterima',
      message: `Nomor Tiket Anda: ${ticketNumber}. Tim Administrator akan memeriksa bukti dan menindaklanjuti.`
    });

    return newReport;
  };

  const resolveAbuseReport = (reportId: string, status: 'RESOLVED_VALID' | 'DISMISSED') => {
    updateAbuseReport(reportId, status === 'RESOLVED_VALID' ? 'ACTION_TAKEN' : 'REJECTED');
  };

  const updateAbuseReport = (reportId: string, status: AbuseReportStatus, adminNotes?: string, actionTakenDetails?: string) => {
    let targetReport: AbuseReport | undefined;
    setAbuseReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      targetReport = {
        ...r,
        status,
        adminNotes: adminNotes ?? r.adminNotes,
        actionTakenDetails: actionTakenDetails ?? r.actionTakenDetails,
        updatedAt: new Date().toISOString(),
        resolvedAt: (status === 'ACTION_TAKEN' || status === 'REJECTED' || status === 'CLOSED') ? new Date().toISOString() : r.resolvedAt
      };
      return targetReport;
    }));

    if (targetReport) {
      const repObj = targetReport as AbuseReport;
      addAudit('REPORT_MODERATED', 'AbuseReport', reportId, `Laporan ${repObj.ticketNumber} diperbarui menjadi ${status} oleh Admin ${currentUser.fullName}.`);

      // Notification to reporter
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: repObj.reporterId,
        title: `Pembaruan Tiket #${repObj.ticketNumber}`,
        message: `Status laporan Anda telah diubah menjadi: ${status}. Catatan tindak lanjut: ${adminNotes || actionTakenDetails || 'Sedang dalam penanganan.'}`,
        type: 'SYSTEM',
        category: 'REPORT',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notif, ...prev]);
    }

    showToast({
      type: 'info',
      title: 'Status Laporan Diperbarui',
      message: `Tiket berhasil diperbarui dengan status: ${status}.`
    });
  };

  // Recipient-isolated notification filtration per current user / role
  const userNotifications = useMemo(() => {
    return notifications.filter(n => {
      // 1. Direct match by recipientId
      if (n.recipientId && n.recipientId === currentUser.id) return true;
      // 2. Direct match by legacy/fallback userId
      if (n.userId && n.userId === currentUser.id) return true;
      // 3. Dual-capability user matching (e.g. Dimas or Rizky who have both Donor & Requester enabled)
      if (currentUser.isDonorEnabled && n.recipientRole === 'DONOR') return true;
      if (currentUser.isRequesterEnabled && n.recipientRole === 'REQUESTER') return true;
      // 4. Role-based matching for facilities & admins
      if (n.recipientRole && n.recipientRole === currentUser.role) {
        if (currentUser.role === 'HOSPITAL' && currentUser.facilityId) {
          return true;
        }
        if (currentUser.role === 'UTD_PMI') return true;
        if (currentUser.role === 'ADMIN') return true;
      }
      // 5. Admin sees system security events and moderation reports
      if (currentUser.role === 'ADMIN' && (n.category === 'ADMIN' || n.category === 'SYSTEM' || n.category === 'REPORT' || n.type === 'SECURITY')) {
        return true;
      }
      return false;
    });
  }, [notifications, currentUser.id, currentUser.role, currentUser.facilityId, currentUser.isDonorEnabled, currentUser.isRequesterEnabled]);

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Reset Demo
  const resetAllData = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUserState(INITIAL_USERS[0]);
    setDonorProfiles(INITIAL_DONOR_PROFILES);
    setRequests(INITIAL_REQUESTS);
    setResponses(INITIAL_RESPONSES);
    setFacilities(INITIAL_FACILITIES);
    setStockItems(INITIAL_STOCK_ITEMS);
    setStockTransactions(INITIAL_STOCK_TRANSACTIONS);
    setBloodBags(INITIAL_BLOOD_BAGS);
    setDonorBookings(INITIAL_BOOKINGS);
    setCurrentCallingQueue('A-01');
    setChatThreads(INITIAL_CHAT_THREADS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setAbuseReports(INITIAL_REPORTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setPrivacySettings(INITIAL_PRIVACY_SETTINGS);
    setActivePublicFeatureState('DONOR');
    showToast({
      type: 'info',
      title: 'Data Demonstrasi Direset',
      message: 'Seluruh data telah dikembalikan ke kondisi awal demonstrasi Kota & Kabupaten Cirebon.'
    });
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        loginUser,
        logoutUser,
        currentUser,
        allUsers,
        setCurrentUser,
        switchRole,
        updateUserProfile,
        registerNewUser,
        activePublicFeature,
        setActivePublicFeature,
        donorProfiles,
        currentDonorProfile,
        updateCurrentDonorProfile,
        toggleDonorAvailability,
        requests,
        createBloodRequest,
        verifyRequestByHospital,
        updateRequestStatus,
        checkDuplicateRequest,
        recordBagReceipt,
        responses,
        addDonorResponse,
        cancelDonorResponse,
        facilities,
        verifyFacility,
        rejectFacility,
        stockItems,
        stockTransactions,
        bloodBags,
        addOrUpdateStock,
        allocateStock,
        handoverStock,
        releaseBloodBag,
        discardBloodBag,
        donorBookings,
        currentCallingQueue,
        callNextQueue,
        createDonorBooking,
        rescheduleDonorBooking,
        checkInBooking,
        updateBookingScreening,
        completeDonorBooking,
        cancelDonorBooking,
        chatThreads,
        chatMessages,
        activeChatThreadId,
        setActiveChatThreadId,
        sendMessage,
        toggleWhatsAppShare,
        getOrCreateChatThread,
        archiveChatThread,
        addFamilyCompanion,
        removeFamilyCompanion,
        revokeFamilyCompanion,
        privacySettings,
        updatePrivacySettings,
        logSensitiveDataAccess,
        abuseReports,
        createAbuseReport,
        resolveAbuseReport,
        updateAbuseReport,
        auditLogs,
        notifications: userNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        toasts,
        showToast,
        removeToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
