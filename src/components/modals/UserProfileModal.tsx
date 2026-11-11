import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  HeartHandshake, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  Trash2,
  MessageCircle,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodType, Rhesus, UserPrivacySettings } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDonorCard?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenDonorCard
}) => {
  const { 
    currentUser, 
    updateUserProfile, 
    currentDonorProfile, 
    updateCurrentDonorProfile,
    privacySettings,
    updatePrivacySettings,
    requests,
    removeFamilyCompanion,
    showToast 
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'privacy' | 'audit'>('profile');

  // Compute authorized family companions across current user's requests
  const userRequests = requests.filter(r => r.requesterId === currentUser.id);
  const familyCompanions = userRequests.flatMap(r => 
    (r.familyCompanions || []).map(fc => ({ 
      ...fc, 
      patientIdentifier: r.patientIdentifier 
    }))
  );

  const [formData, setFormData] = useState({
    fullName: currentUser.fullName,
    birthDate: currentUser.birthDate || '1998-05-14',
    phone: currentUser.phone,
    email: currentUser.email || '',
    city: currentUser.city || 'Kota Cirebon',
    district: currentUser.district || 'Kesambi',
    isDonorEnabled: currentUser.isDonorEnabled ?? true,
    isRequesterEnabled: currentUser.isRequesterEnabled ?? true,
    bloodType: (currentDonorProfile?.bloodType || 'O') as BloodType,
    rhesus: (currentDonorProfile?.rhesus || 'POSITIVE') as Rhesus,
    isAvailable: currentDonorProfile?.isAvailable ?? true
  });

  const [privacyFormData, setPrivacyFormData] = useState<UserPrivacySettings>({
    consentDataProcessing: privacySettings?.consentDataProcessing ?? true,
    consentContactSharing: privacySettings?.consentContactSharing ?? true,
    profileVisibility: privacySettings?.profileVisibility || 'PUBLIC_VERIFIED',
    notificationPreferences: privacySettings?.notificationPreferences || {
      email: true,
      sms: false,
      inApp: true,
      emergencyBroadcast: true
    },
    sensitiveDataAccessLog: privacySettings?.sensitiveDataAccessLog || []
  });

  // Calculate age automatically when birthDate changes
  const calculateAge = (bDate: string) => {
    if (!bDate) return 0;
    const diffMs = Date.now() - new Date(bDate).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  };

  const calculatedAge = calculateAge(formData.birthDate);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: currentUser.fullName,
        birthDate: currentUser.birthDate || '1998-05-14',
        phone: currentUser.phone,
        email: currentUser.email || '',
        city: currentUser.city || 'Kota Cirebon',
        district: currentUser.district || 'Kesambi',
        isDonorEnabled: currentUser.isDonorEnabled ?? true,
        isRequesterEnabled: currentUser.isRequesterEnabled ?? true,
        bloodType: (currentDonorProfile?.bloodType || 'O') as BloodType,
        rhesus: (currentDonorProfile?.rhesus || 'POSITIVE') as Rhesus,
        isAvailable: currentDonorProfile?.isAvailable ?? true
      });
      if (privacySettings) {
        setPrivacyFormData(privacySettings);
      }
    }
  }, [isOpen, currentUser, currentDonorProfile, privacySettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.isDonorEnabled && !formData.isRequesterEnabled) {
      showToast({
        type: 'warning',
        title: 'Minimal Satu Peran Aktif',
        message: 'Harap aktifkan setidaknya fitur Pendonor Sukarela atau Pencari Donor.'
      });
      return;
    }

    // Update user profile in AppContext
    updateUserProfile({
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      phone: formData.phone,
      email: formData.email,
      city: formData.city,
      district: formData.district,
      isDonorEnabled: formData.isDonorEnabled,
      isRequesterEnabled: formData.isRequesterEnabled
    });

    // Update donor profile details if donor feature is enabled
    if (formData.isDonorEnabled) {
      updateCurrentDonorProfile({
        bloodType: formData.bloodType,
        rhesus: formData.rhesus,
        isAvailable: formData.isAvailable,
        city: formData.city,
        district: formData.district
      });
    }

    // Update privacy settings
    updatePrivacySettings({
      consentContactSharing: privacyFormData.consentContactSharing,
      profileVisibility: privacyFormData.profileVisibility,
      consentDataProcessing: privacyFormData.consentDataProcessing
    });

    showToast({
      type: 'success',
      title: 'Profil Berhasil Disimpan',
      message: 'Data identitas, preferensi privasi UU PDP, dan pengaturan peran Anda telah diperbarui.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="user-profile-title" className="text-sm font-bold text-slate-900">
                Profil Pengguna & Pengaturan Peran
              </h3>
              <p className="text-[11px] text-slate-500">
                Kelola identitas, wilayah Cirebon, dan peran aktif akun Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/30 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveProfileTab('profile')}
            className={`pb-2.5 px-2 border-b-2 cursor-pointer transition-colors ${
              activeProfileTab === 'profile'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Identitas & Peran Akun
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab('privacy')}
            className={`pb-2.5 px-2 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeProfileTab === 'privacy'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privasi & Persetujuan PDP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveProfileTab('audit')}
            className={`pb-2.5 px-2 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeProfileTab === 'audit'
                ? 'border-rose-600 text-rose-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Akses Data Sensitif</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* TAB 1: IDENTITAS & PERAN */}
          {activeProfileTab === 'profile' && (
            <>
              {/* Section 1: Basic Identity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    1. Data Identitas Dasar
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    ID: {currentUser.donorIdNumber || currentUser.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap (Sesuai KTP):
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nomor Handphone (WhatsApp):
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Lahir:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        required
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden bg-white"
                      />
                      <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700 whitespace-nowrap">
                        {calculatedAge} Th
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Usia dihitung otomatis. Syarat donor sukarela: 17–65 tahun.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Email:
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Domicile: Kota or Kab Cirebon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Wilayah Domisili Operasional:
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden bg-white"
                    >
                      <option value="Kota Cirebon">Kota Cirebon</option>
                      <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kecamatan:
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Contoh: Kesambi / Harjamukti / Sumber"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Flexible Role Capabilities */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    2. Pengaturan Peran & Kemampuan Akun
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Satu Akun Bersama
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Feature A: Pendonor Sukarela */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    formData.isDonorEnabled ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${formData.isDonorEnabled ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-500'}`}>
                          <HeartHandshake className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Kemampuan: Pendonor Sukarela
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Daftar ketersediaan donor, terima kecocokan pasien, dan miliki Kartu Donor Digital.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDonorEnabled}
                          onChange={(e) => setFormData({ ...formData, isDonorEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-700"></div>
                      </label>
                    </div>

                    {/* Sub-settings if Donor is enabled */}
                    {formData.isDonorEnabled && (
                      <div className="mt-4 pt-3 border-t border-rose-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Golongan Darah ABO:
                          </label>
                          <select
                            value={formData.bloodType}
                            onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as BloodType })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                          >
                            <option value="A">Golongan A</option>
                            <option value="B">Golongan B</option>
                            <option value="AB">Golongan AB</option>
                            <option value="O">Golongan O</option>
                            <option value="UNKNOWN">Belum Tahu (Periksa Saat Donor)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Faktor Rhesus:
                          </label>
                          <select
                            value={formData.rhesus}
                            onChange={(e) => setFormData({ ...formData, rhesus: e.target.value as Rhesus })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                          >
                            <option value="POSITIVE">Rhesus Positif (+)</option>
                            <option value="NEGATIVE">Rhesus Negatif (-)</option>
                            <option value="UNKNOWN">Belum Tahu</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="modalAvailable"
                              checked={formData.isAvailable}
                              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                              className="rounded text-rose-700 focus:ring-rose-500"
                            />
                            <label htmlFor="modalAvailable" className="text-xs font-semibold text-slate-800 cursor-pointer">
                              Aktifkan status kesiapan panggilan donor
                            </label>
                          </div>

                          {onOpenDonorCard && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenDonorCard();
                              }}
                              className="px-3 py-1.5 bg-white border border-rose-300 hover:border-rose-400 text-rose-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Lihat Kartu Donor</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feature B: Pencari Donor (Keluarga Pasien) */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    formData.isRequesterEnabled ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${formData.isRequesterEnabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Kemampuan: Pencari Donor (Keluarga Pasien)
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Ajukan kebutuhan darah pasien darurat di RS Cirebon dan pantau respons relawan.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isRequesterEnabled}
                          onChange={(e) => setFormData({ ...formData, isRequesterEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-700"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PRIVASI & PERSETUJUAN DATA (UU PDP NO. 27/2022) */}
          {activeProfileTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              {/* PDP Consent Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm text-emerald-950">
                    Persetujuan Pemrosesan Data Pribadi (UU No. 27 Tahun 2022)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  Status: <strong>Telah Diberikan & Aktif (Kepatuhan UU No. 27/2022)</strong>.
                  Data Anda diproses semata-mata untuk tujuan kemanusiaan pencocokan donor darah dan verifikasi identitas di fasilitas kesehatan berwenang wilayah Cirebon.
                </p>
              </div>

              {/* Consent Toggle: WhatsApp Sharing */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Izin Berbagi Kontak WhatsApp ke Keluarga Pasien</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Jika diaktifkan, keluarga pasien yang terverifikasi dapat menghubungi Anda via WhatsApp saat Anda mengonfirmasi kesediaan donor. Jika dinonaktifkan, komunikasi hanya melalui pesan dalam aplikasi (In-App Chat).
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={privacyFormData.consentContactSharing}
                    onChange={(e) => setPrivacyFormData({
                      ...privacyFormData,
                      consentContactSharing: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Setting: Profile Visibility */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">
                  Visibilitas Profil & Kecocokan Donor:
                </label>
                <select
                  value={privacyFormData.profileVisibility}
                  onChange={(e) => setPrivacyFormData({
                    ...privacyFormData,
                    profileVisibility: e.target.value as UserPrivacySettings['profileVisibility']
                  })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                >
                  <option value="PUBLIC_VERIFIED">Publik Terverifikasi (Hanya Pasien & Relawan Terverifikasi)</option>
                  <option value="FASKES_ONLY">Hanya Fasilitas Kesehatan (RS & PMI Cirebon)</option>
                  <option value="PRIVATE">Privat Penuh (Disembunyikan dari Pencarian Publik)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Melindungi privasi Anda dari penyalahgunaan pihak ketiga atau pesan spam.
                </p>
              </div>

              {/* Family Companions Authorization Management */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                    <span>Daftar Pendamping Pasien yang Diotorisasi</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {familyCompanions.length} Pendamping
                  </span>
                </div>

                {familyCompanions.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">
                    Belum ada anggota keluarga/pendamping yang diberi wewenang menerima darah pada permohonan Anda.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {familyCompanions.map(fc => (
                      <div key={fc.id} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-800">{fc.fullName} ({fc.relationship})</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            No. HP: {fc.phone} · Pasien: {fc.patientIdentifier}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Cabut otorisasi pengambilan darah untuk ${fc.fullName}?`)) {
                              removeFamilyCompanion(fc.requestId, fc.id);
                            }
                          }}
                          className="px-2.5 py-1 text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cabut Izin</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT AKSES DATA SENSITIF */}
          {activeProfileTab === 'audit' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-100/70 border border-slate-200 rounded-2xl text-[11px] text-slate-700 leading-relaxed">
                <strong>Transparansi Hak Subjek Data:</strong> Sesuai UU PDP, Anda berhak mengetahui faskes atau petugas mana yang telah mengakses data identitas/kontak Anda demi kepentingan penanganan donor darah.
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Waktu Akses</th>
                      <th className="py-2.5 px-3">Petugas / Aktor</th>
                      <th className="py-2.5 px-3">Role / Instansi</th>
                      <th className="py-2.5 px-3">Tujuan Akses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {privacyFormData.sensitiveDataAccessLog.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/60 font-mono text-[11px]">
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                          {new Date(log.accessedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800">
                          {log.accessedByName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                            {log.accessedByRole}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">
                          {log.purpose}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Profil & Privasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
