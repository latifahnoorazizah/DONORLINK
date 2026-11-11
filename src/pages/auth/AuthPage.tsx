import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Building2, 
  Syringe, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, User, BloodType, Rhesus } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';

interface AuthPageProps {
  onSuccess: (role: UserRole) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { 
    allUsers, 
    loginUser, 
    registerNewUser, 
    showToast 
  } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginMethod, setLoginMethod] = useState<'EMAIL' | 'PHONE' | 'GOOGLE' | 'APPLE'>('EMAIL');

  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneLogin, setPhoneLogin] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('DONOR');

  // Registration Multi-step states (Step 1 to 4)
  const [regCategory, setRegCategory] = useState<'PUBLIC' | 'FACILITY'>('PUBLIC');
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [regData, setRegData] = useState({
    fullName: '',
    birthDate: '1999-08-17',
    phone: '',
    email: '',
    city: 'Kota Cirebon',
    district: '',
    agreePrivacy: false,
    // Step 2: Capabilities
    isDonorEnabled: true,
    isRequesterEnabled: false,
    // Step 3: Donor details
    bloodType: 'UNKNOWN' as BloodType,
    rhesus: 'UNKNOWN' as Rhesus,
    lastDonationDate: '',
    neverDonatedBefore: true,
    isAvailable: true,
    weightKg: 58
  });

  // Facility Registration state (Rumah Sakit BDRS / UTD PMI)
  const [facRegData, setFacRegData] = useState({
    facilityType: 'HOSPITAL' as 'HOSPITAL' | 'UTD_PMI',
    facilityName: '',
    permitNumber: '',
    city: 'Kota Cirebon',
    district: '',
    address: '',
    phone: '',
    picName: '',
    picPhone: '',
    email: '',
    agreeTerms: false
  });

  // Calculate age automatically
  const calculateAge = (bDate: string) => {
    if (!bDate) return 0;
    const diffMs = Date.now() - new Date(bDate).getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  };

  const calculatedAge = calculateAge(regData.birthDate);

  const handle1ClickLogin = (user: User) => {
    loginUser(user);
    onSuccess(user.role);
  };

  const handleOAuthLogin = (provider: 'Google' | 'Apple ID') => {
    const user = allUsers.find(u => u.role === selectedRole) || allUsers[0];
    loginUser(user);
    showToast({
      type: 'success',
      title: `Masuk dengan ${provider}`,
      message: `Autentikasi ${provider} berhasil untuk ${user.fullName}.`
    });
    onSuccess(user.role);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'PHONE') {
      const cleanPhone = phoneLogin.replace(/[^0-9]/g, '');
      const existing = allUsers.find(u => u.phone.replace(/[^0-9]/g, '') === cleanPhone);
      if (existing) {
        loginUser(existing);
        onSuccess(existing.role);
      } else {
        const user = allUsers[0];
        loginUser(user);
        onSuccess(user.role);
      }
    } else {
      const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        loginUser(existing);
        onSuccess(existing.role);
      } else {
        const user = allUsers.find(u => u.role === selectedRole) || allUsers[0];
        loginUser(user);
        onSuccess(user.role);
      }
    }
  };

  // Step validation
  const validateStep1 = () => {
    if (!regData.fullName.trim()) {
      showToast({ type: 'warning', title: 'Nama Lengkap Wajib', message: 'Harap masukkan nama lengkap sesuai kartu identitas.' });
      return false;
    }
    if (!regData.phone.trim()) {
      showToast({ type: 'warning', title: 'Nomor HP Wajib', message: 'Harap masukkan nomor WhatsApp aktif.' });
      return false;
    }
    if (!regData.district.trim()) {
      showToast({ type: 'warning', title: 'Kecamatan Wajib', message: 'Harap isi nama kecamatan di Cirebon.' });
      return false;
    }
    if (!regData.agreePrivacy) {
      showToast({ type: 'warning', title: 'Persetujuan Diperlukan', message: 'Harap setujui ketentuan privasi dan pedoman keselamatan donor.' });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (regStep === 1) {
      if (!validateStep1()) return;
      setRegStep(2);
    } else if (regStep === 2) {
      if (!regData.isDonorEnabled && !regData.isRequesterEnabled) {
        showToast({
          type: 'warning',
          title: 'Pilih Kemampuan',
          message: 'Pilih minimal satu: Pendonor Sukarela atau Pencari Donor (atau keduanya).'
        });
        return;
      }
      setRegStep(3);
    } else if (regStep === 3) {
      setRegStep(4);
    }
  };

  const handleFinishRegistration = () => {
    const newUser = registerNewUser({
      fullName: regData.fullName,
      birthDate: regData.birthDate,
      phone: regData.phone,
      email: regData.email || `${regData.fullName.toLowerCase().replace(/\s+/g, '.')}@donorlink.id`,
      city: regData.city,
      district: regData.district,
      isDonorEnabled: regData.isDonorEnabled,
      isRequesterEnabled: regData.isRequesterEnabled,
      donorData: regData.isDonorEnabled ? {
        bloodType: regData.bloodType,
        rhesus: regData.rhesus,
        lastDonationDate: regData.neverDonatedBefore ? null : regData.lastDonationDate,
        isAvailable: regData.isAvailable,
        weightKg: regData.weightKg
      } : undefined
    });

    onSuccess(newUser.role);
  };

  const handleFacilityRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facRegData.facilityName.trim()) {
      showToast({ type: 'warning', title: 'Nama Faskes Wajib', message: 'Harap masukkan nama resmi institusi/rumah sakit/PMI.' });
      return;
    }
    if (!facRegData.permitNumber.trim()) {
      showToast({ type: 'warning', title: 'Nomor Izin Wajib', message: 'Harap masukkan nomor surat izin operasional Kemenkes / Dinkes.' });
      return;
    }
    if (!facRegData.picName.trim()) {
      showToast({ type: 'warning', title: 'Nama PIC Wajib', message: 'Harap masukkan nama penanggung jawab / kepala unit.' });
      return;
    }
    if (!facRegData.picPhone.trim()) {
      showToast({ type: 'warning', title: 'WhatsApp PIC Wajib', message: 'Harap masukkan nomor WhatsApp penanggung jawab.' });
      return;
    }
    if (!facRegData.agreeTerms) {
      showToast({ type: 'warning', title: 'Pernyataan Keabsahan', message: 'Harap centang pernyataan keabsahan dokumen perizinan faskes.' });
      return;
    }

    const newFacilityUser = registerNewUser({
      fullName: facRegData.picName,
      phone: facRegData.picPhone,
      email: facRegData.email || `${facRegData.facilityName.toLowerCase().replace(/[^a-z0-9]/g, '')}@donorlink.id`,
      city: facRegData.city,
      district: facRegData.district || 'Kesambi',
      role: facRegData.facilityType,
      facilityData: {
        facilityName: facRegData.facilityName,
        facilityType: facRegData.facilityType,
        permitNumber: facRegData.permitNumber,
        address: facRegData.address || `${facRegData.city}`,
        phone: facRegData.phone || facRegData.picPhone,
        picPosition: facRegData.facilityType === 'HOSPITAL' ? 'Kepala / Staf BDRS' : 'Kepala / Staf UTD PMI'
      }
    });

    onSuccess(newFacilityUser.role);
  };

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; desc: string }> = {
    DONOR: {
      label: 'Pendonor Sukarela',
      icon: <HeartHandshake className="w-5 h-5 text-rose-700" />,
      desc: 'Mendaftarkan kesiapan donor & menerima panggilan darurat.'
    },
    REQUESTER: {
      label: 'Pencari Donor / Keluarga',
      icon: <Search className="w-5 h-5 text-blue-700" />,
      desc: 'Mengajukan kebutuhan darah pasien & memantau relawan.'
    },
    HOSPITAL: {
      label: 'Rumah Sakit (BDRS)',
      icon: <Building2 className="w-5 h-5 text-amber-700" />,
      desc: 'Verifikasi formulir transfusi & koordinasi kantong darah.'
    },
    UTD_PMI: {
      label: 'PMI / Unit Transfusi Darah',
      icon: <Syringe className="w-5 h-5 text-red-700" />,
      desc: 'Koordinasi stok wilayah & monitoring kebutuhan darah kota.'
    },
    ADMIN: {
      label: 'Administrator Sistem',
      icon: <ShieldCheck className="w-5 h-5 text-purple-700" />,
      desc: 'Verifikasi faskes, moderasi laporan, dan audit keamanan.'
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <div className="text-center space-y-3">
        <BrandLogo variant="full" imgClassName="h-24 sm:h-28 md:h-32" />
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Sistem koordinasi donor darah sukarela wilayah Kota Cirebon & Kabupaten Cirebon.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Quick 1-Click Demo Accounts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              1-Klik Akses Demo (5 Role Terisolasi)
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik salah satu akun di bawah untuk langsung beralih ke dashboard perannya:
            </p>
          </div>

          <div className="space-y-2.5">
            {allUsers.map(u => (
              <button
                key={u.id}
                onClick={() => handle1ClickLogin(u)}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-white transition-colors">
                    {roleMeta[u.role]?.icon}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span>{u.fullName}</span>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {roleMeta[u.role]?.desc}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Custom Form with 4 Login Methods or Multi-Step Registration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {/* Top Switcher: Masuk Akun / Daftar Baru */}
          <div className="flex border-b border-slate-100 pb-3 gap-4 text-xs font-bold">
            <button
              onClick={() => {
                setMode('LOGIN');
                setRegStep(1);
              }}
              className={`pb-1 cursor-pointer transition-colors ${mode === 'LOGIN' ? 'text-rose-700 border-b-2 border-rose-700 font-extrabold' : 'text-slate-400 hover:text-slate-700'}`}
            >
              Masuk Akun
            </button>
            <button
              onClick={() => setMode('REGISTER')}
              className={`pb-1 cursor-pointer transition-colors ${mode === 'REGISTER' ? 'text-rose-700 border-b-2 border-rose-700 font-extrabold' : 'text-slate-400 hover:text-slate-700'}`}
            >
              Daftar Baru
            </button>
          </div>

          {/* ===================== MODE 1: LOGIN ===================== */}
          {mode === 'LOGIN' && (
            <div className="space-y-4">
              {/* 4 Methods Tab */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setLoginMethod('EMAIL')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-colors cursor-pointer ${
                    loginMethod === 'EMAIL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('PHONE')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-colors cursor-pointer ${
                    loginMethod === 'PHONE' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Nomor HP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('GOOGLE')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-colors cursor-pointer ${
                    loginMethod === 'GOOGLE' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('APPLE')}
                  className={`py-1.5 px-1 rounded-lg text-center transition-colors cursor-pointer ${
                    loginMethod === 'APPLE' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Apple ID
                </button>
              </div>

              {/* Google Fast Login */}
              {loginMethod === 'GOOGLE' && (
                <div className="space-y-3 py-2 text-xs">
                  <p className="text-slate-600 text-xs">
                    Masuk cepat dan aman menggunakan akun Google terverifikasi Anda.
                  </p>
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">Pilih Peran Akun:</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="DONOR">Pendonor Sukarela</option>
                      <option value="REQUESTER">Pencari Donor (Keluarga Pasien)</option>
                      <option value="HOSPITAL">Rumah Sakit / Faskes (BDRS)</option>
                      <option value="UTD_PMI">PMI / Unit Transfusi Darah</option>
                      <option value="ADMIN">Administrator Sistem</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('Google')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Lanjutkan dengan Google</span>
                  </button>
                </div>
              )}

              {/* Apple ID Fast Login */}
              {loginMethod === 'APPLE' && (
                <div className="space-y-3 py-2 text-xs">
                  <p className="text-slate-600 text-xs">
                    Gunakan Apple ID untuk masuk dengan perlindungan privasi akun Apple.
                  </p>
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">Pilih Peran Akun:</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="DONOR">Pendonor Sukarela</option>
                      <option value="REQUESTER">Pencari Donor (Keluarga Pasien)</option>
                      <option value="HOSPITAL">Rumah Sakit / Faskes (BDRS)</option>
                      <option value="UTD_PMI">PMI / Unit Transfusi Darah</option>
                      <option value="ADMIN">Administrator Sistem</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('Apple ID')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Lanjutkan dengan Apple ID</span>
                  </button>
                </div>
              )}

              {/* Phone or Email Standard Login Form */}
              {(loginMethod === 'EMAIL' || loginMethod === 'PHONE') && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  {loginMethod === 'PHONE' ? (
                    <>
                      <div>
                        <label className="font-semibold text-slate-800 block mb-1">Nomor Handphone Terdaftar:</label>
                        <input
                          type="tel"
                          required
                          value={phoneLogin}
                          onChange={(e) => setPhoneLogin(e.target.value)}
                          placeholder="Contoh: 0812-3456-7890"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-800 block mb-1">Kode Verifikasi OTP (Simulasi):</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="6 digit kode OTP (bebas diisi)"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono text-center tracking-widest"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="font-semibold text-slate-800 block mb-1">Alamat Email:</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-800 block mb-1">Kata Sandi:</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors mt-2"
                  >
                    Masuk ke Dashboard
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ===================== MODE 2: MULTI-STEP REGISTRATION ===================== */}
          {mode === 'REGISTER' && (
            <div className="space-y-4">
              {/* Category Switcher: Masyarakat Umum vs Fasilitas Kesehatan */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setRegCategory('PUBLIC')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    regCategory === 'PUBLIC'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-rose-700" />
                  <span>Masyarakat Umum</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegCategory('FACILITY')}
                  className={`py-1.5 px-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    regCategory === 'FACILITY'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Fasilitas Kesehatan</span>
                </button>
              </div>

              {/* ===================== CATEGORY A: MASYARAKAT UMUM (4-STEP) ===================== */}
              {regCategory === 'PUBLIC' && (
                <div className="space-y-4">
                  {/* Step indicator bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-rose-700 text-white text-[11px] flex items-center justify-center font-mono">
                        {regStep}
                      </span>
                      <span>
                        {regStep === 1 && '1. Identitas Dasar'}
                        {regStep === 2 && '2. Pilih Kemampuan'}
                        {regStep === 3 && '3. Data Tambahan'}
                        {regStep === 4 && '4. Konfirmasi'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600">
                      Langkah {regStep} dari 4
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map(s => (
                      <div 
                        key={s} 
                        className={`h-1.5 rounded-full transition-all ${
                          s <= regStep ? 'bg-rose-700' : 'bg-slate-200'
                        }`} 
                      />
                    ))}
                  </div>

                  {/* Step 1: Identitas Dasar */}
                  {regStep === 1 && (
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <label className="font-semibold text-slate-800 block mb-1">
                          Nama Lengkap (Sesuai KTP): <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={regData.fullName}
                          onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                          placeholder="Contoh: Muhammad Ihsan"
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-800 block mb-1">
                          Tanggal Lahir: <span className="text-rose-600">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            required
                            value={regData.birthDate}
                            onChange={(e) => setRegData({ ...regData, birthDate: e.target.value })}
                            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                          />
                          <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700 whitespace-nowrap">
                            {calculatedAge} Tahun
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 mt-1 block">
                          Usia dihitung otomatis dari tanggal lahir.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-800 block mb-1">
                            Nomor HP (WhatsApp): <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={regData.phone}
                            onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                            placeholder="0812-xxxx-xxxx"
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-800 block mb-1">
                            Email:
                          </label>
                          <input
                            type="email"
                            value={regData.email}
                            onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                            placeholder="nama@email.com"
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Domicile Cirebon Only */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-800 block mb-1">
                            Wilayah Operasional: <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={regData.city}
                            onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                          >
                            <option value="Kota Cirebon">Kota Cirebon</option>
                            <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
                          </select>
                        </div>
                        <div>
                          <label className="font-semibold text-slate-800 block mb-1">
                            Kecamatan: <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={regData.district}
                            onChange={(e) => setRegData({ ...regData, district: e.target.value })}
                            placeholder="Contoh: Kesambi / Harjamukti"
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Privacy Agreement Checkbox */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={regData.agreePrivacy}
                            onChange={(e) => setRegData({ ...regData, agreePrivacy: e.target.checked })}
                            className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                          />
                          <span className="text-[11px] text-slate-600 leading-relaxed">
                            Saya menyetujui pemrosesan data identitas untuk koordinasi donor darah sukarela dan memahami bahwa DONORLINK merupakan platform koordinasi pendukung, bukan penentu kelayakan medis.
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                        <span>Lanjut: Pilih Kemampuan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Role / Capability Selection */}
                  {regStep === 2 && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Bagaimana kamu ingin menggunakan DONORLINK?
                        </h3>
                        <p className="text-slate-600 text-xs mt-0.5">
                          Kamu dapat memilih salah satu atau keduanya sekaligus dalam satu akun:
                        </p>
                      </div>

                      {/* Capability A */}
                      <label className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        regData.isDonorEnabled ? 'border-rose-600 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={regData.isDonorEnabled}
                            onChange={(e) => setRegData({ ...regData, isDonorEnabled: e.target.checked })}
                            className="mt-1 rounded text-rose-700 focus:ring-rose-500 w-4 h-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                Saya ingin menjadi Pendonor Darah Sukarela
                              </span>
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                                Kartu Donor Digital
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Menerima pemberitahuan jika ada pasien di Cirebon yang membutuhkan golongan darah Anda, serta memiliki Kartu Identitas Pendonor.
                            </p>
                          </div>
                        </div>
                      </label>

                      {/* Capability B */}
                      <label className={`block p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        regData.isRequesterEnabled ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={regData.isRequesterEnabled}
                            onChange={(e) => setRegData({ ...regData, isRequesterEnabled: e.target.checked })}
                            className="mt-1 rounded text-blue-700 focus:ring-blue-500 w-4 h-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                Saya ingin dapat mengajukan kebutuhan donor darah
                              </span>
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                                Keluarga / Pasien
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">
                              Membuat permohonan donor darah darurat untuk pasien di RS Cirebon dan memantau respons relawan secara transparan.
                            </p>
                          </div>
                        </div>
                      </label>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(1)}
                          className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Kembali</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Lanjut: Data Tambahan</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Additional Details (Conditional) */}
                  {regStep === 3 && (
                    <div className="space-y-4 text-xs">
                      {regData.isDonorEnabled ? (
                        <>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">
                              Lengkapi Data Pendonor Sukarela
                            </h3>
                            <p className="text-slate-600 text-xs mt-0.5">
                              Informasi ini digunakan untuk pencocokan kebutuhan darah pasien.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-semibold text-slate-800 block mb-1">
                                Golongan Darah ABO:
                              </label>
                              <select
                                value={regData.bloodType}
                                onChange={(e) => setRegData({ ...regData, bloodType: e.target.value as BloodType })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                              >
                                <option value="A">Golongan A</option>
                                <option value="B">Golongan B</option>
                                <option value="AB">Golongan AB</option>
                                <option value="O">Golongan O</option>
                                <option value="UNKNOWN">Belum Tahu (Cek di Faskes)</option>
                              </select>
                            </div>

                            <div>
                              <label className="font-semibold text-slate-800 block mb-1">
                                Faktor Rhesus:
                              </label>
                              <select
                                value={regData.rhesus}
                                onChange={(e) => setRegData({ ...regData, rhesus: e.target.value as Rhesus })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                              >
                                <option value="POSITIVE">Rhesus Positif (+)</option>
                                <option value="NEGATIVE">Rhesus Negatif (-)</option>
                                <option value="UNKNOWN">Belum Tahu</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="font-semibold text-slate-800 block mb-1">
                              Riwayat Donor Darah Terakhir:
                            </label>
                            <label className="flex items-center gap-2 mb-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={regData.neverDonatedBefore}
                                onChange={(e) => setRegData({ ...regData, neverDonatedBefore: e.target.checked })}
                                className="rounded text-rose-700 focus:ring-rose-500"
                              />
                              <span className="text-xs text-slate-700">Saya belum pernah mendonorkan darah sebelumnya</span>
                            </label>

                            {!regData.neverDonatedBefore && (
                              <input
                                type="date"
                                value={regData.lastDonationDate}
                                onChange={(e) => setRegData({ ...regData, lastDonationDate: e.target.value })}
                                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                              />
                            )}
                          </div>

                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800 block text-xs">
                                Status Kesiapan Awal
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {regData.isAvailable ? 'Siap menerima panggilan donor' : 'Sedang tidak aktif'}
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={regData.isAvailable}
                                onChange={(e) => setRegData({ ...regData, isAvailable: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="py-4 text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                            <Search className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            Akun Pencari Donor Siap Digunakan
                          </h3>
                          <p className="text-xs text-slate-600 max-w-sm mx-auto">
                            Anda dapat langsung membuat permintaan kebutuhan darah pasien di rumah sakit wilayah Cirebon setelah pendaftaran selesai.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(2)}
                          className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Kembali</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Lanjut: Konfirmasi Ringkasan</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Summary Confirmation */}
                  {regStep === 4 && (
                    <div className="space-y-4 text-xs">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Konfirmasi Ringkasan Pendaftaran
                        </h3>
                        <p className="text-slate-600 text-xs mt-0.5">
                          Periksa kembali ringkasan data sebelum menyelesaikan pembuatan akun:
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-slate-600">Nama Lengkap:</span>
                          <span className="font-bold text-slate-900">{regData.fullName}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-slate-600">Usia & Tanggal Lahir:</span>
                          <span className="font-bold text-slate-900">
                            {calculatedAge} Tahun ({regData.birthDate})
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-slate-600">Nomor WhatsApp:</span>
                          <span className="font-mono font-bold text-slate-900">{regData.phone}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-slate-600">Domisili Operasional:</span>
                          <span className="font-semibold text-slate-900">
                            {regData.district ? `${regData.district}, ` : ''}{regData.city}
                          </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                          <span className="text-slate-600">Kemampuan Akun:</span>
                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {regData.isDonorEnabled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                Pendonor Sukarela
                              </span>
                            )}
                            {regData.isRequesterEnabled && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                Pencari Donor
                              </span>
                            )}
                          </div>
                        </div>

                        {regData.isDonorEnabled && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Golongan Darah:</span>
                            <span className="font-bold text-slate-900">
                              {regData.bloodType === 'UNKNOWN' ? 'Belum Tahu' : regData.bloodType} {regData.rhesus === 'POSITIVE' ? '(+)' : regData.rhesus === 'NEGATIVE' ? '(-)' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setRegStep(3)}
                          className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Kembali</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleFinishRegistration}
                          className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Selesaikan Pendaftaran</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===================== CATEGORY B: FASILITAS KESEHATAN (RS & PMI) ===================== */}
              {regCategory === 'FACILITY' && (
                <form onSubmit={handleFacilityRegistrationSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Pendaftaran Fasilitas Kesehatan Resmi Cirebon
                    </h3>
                    <p className="text-slate-600 text-xs mt-0.5">
                      Khusus Bank Darah Rumah Sakit (BDRS) dan Unit Transfusi Darah (PMI).
                    </p>
                  </div>

                  {/* Faskes Type Choice */}
                  <div>
                    <label className="font-semibold text-slate-800 block mb-1.5">
                      Jenis Fasilitas Pelayanan Darah: <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <label className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        facRegData.facilityType === 'HOSPITAL' 
                          ? 'border-amber-600 bg-amber-50/50' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                        <input
                          type="radio"
                          name="facilityType"
                          value="HOSPITAL"
                          checked={facRegData.facilityType === 'HOSPITAL'}
                          onChange={() => setFacRegData({ ...facRegData, facilityType: 'HOSPITAL' })}
                          className="mt-0.5 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">Rumah Sakit (BDRS)</div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Bank Darah RS & verifikasi transfusi pasien.</p>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        facRegData.facilityType === 'UTD_PMI' 
                          ? 'border-rose-600 bg-rose-50/50' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                        <input
                          type="radio"
                          name="facilityType"
                          value="UTD_PMI"
                          checked={facRegData.facilityType === 'UTD_PMI'}
                          onChange={() => setFacRegData({ ...facRegData, facilityType: 'UTD_PMI' })}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <div className="font-bold text-slate-900">UTD PMI Wilayah</div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Unit Transfusi Darah PMI & donor sukarela.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nama Resmi Fasilitas Kesehatan: <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facRegData.facilityName}
                      onChange={(e) => setFacRegData({ ...facRegData, facilityName: e.target.value })}
                      placeholder={facRegData.facilityType === 'HOSPITAL' ? 'Contoh: RS Mitra Plumbon Cirebon' : 'Contoh: UTD PMI Cabang Kabupaten Cirebon'}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Nomor Surat Izin Operasional Faskes: <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={facRegData.permitNumber}
                      onChange={(e) => setFacRegData({ ...facRegData, permitNumber: e.target.value })}
                      placeholder="Contoh: 503/042/DINKES-SIO-RS/2024"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Nomor izin ini akan divalidasi oleh Super Admin DONORLINK sebelum akun faskes aktif.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Wilayah Operasional: <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={facRegData.city}
                        onChange={(e) => setFacRegData({ ...facRegData, city: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                      >
                        <option value="Kota Cirebon">Kota Cirebon</option>
                        <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Kecamatan:
                      </label>
                      <input
                        type="text"
                        value={facRegData.district}
                        onChange={(e) => setFacRegData({ ...facRegData, district: e.target.value })}
                        placeholder="Contoh: Kejaksan / Plumbon"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-800 block mb-1">
                      Alamat Lengkap Institusi:
                    </label>
                    <input
                      type="text"
                      value={facRegData.address}
                      onChange={(e) => setFacRegData({ ...facRegData, address: e.target.value })}
                      placeholder="Jl. Raya Cirebon No. xx..."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Nama Penanggung Jawab (PIC): <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={facRegData.picName}
                        onChange={(e) => setFacRegData({ ...facRegData, picName: e.target.value })}
                        placeholder="dr. / Petugas BDRS / UTD"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Nomor WhatsApp PIC: <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={facRegData.picPhone}
                        onChange={(e) => setFacRegData({ ...facRegData, picPhone: e.target.value })}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Email Resmi Fasilitas:
                      </label>
                      <input
                        type="email"
                        value={facRegData.email}
                        onChange={(e) => setFacRegData({ ...facRegData, email: e.target.value })}
                        placeholder="bdrs@rumahsakit.id"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-800 block mb-1">
                        Telepon Resmi Faskes / Hotline:
                      </label>
                      <input
                        type="tel"
                        value={facRegData.phone}
                        onChange={(e) => setFacRegData({ ...facRegData, phone: e.target.value })}
                        placeholder="(0231) xxx-xxx"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Academic / Lecturer Evaluation Hint */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>Alur Verifikasi Faskes (Kebutuhan Evaluasi UAS RPL)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      Setelah mendaftar, akun faskes akan berstatus <strong>PENDING_VERIFICATION</strong>. Dosen/Penilai dapat login sebagai <strong>Super Admin</strong> (<code className="font-mono font-bold">latifahnoorazizah7@gmail.com</code>) melalui akses 1-Klik Akun Demo di sebelah kiri untuk melihat rincian pengajuan faskes baru, memvalidasi nomor izin, dan menyetujuinya langsung.
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facRegData.agreeTerms}
                        onChange={(e) => setFacRegData({ ...facRegData, agreeTerms: e.target.checked })}
                        className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                      />
                      <span className="text-[11px] text-slate-600 leading-relaxed">
                        Saya menyatakan bertindak sebagai perwakilan resmi institusi kesehatan di Cirebon dan menjamin keabsahan izin operasional sesuai UU Kesehatan & Standar Pelayanan Transfusi Darah.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ajukan Pendaftaran Fasilitas Kesehatan</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
