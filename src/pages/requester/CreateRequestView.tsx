import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Upload, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  AlertTriangle,
  Heart,
  Users,
  UserCheck,
  MessageSquare,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodType, Rhesus, ComponentType, UrgencyLevel, BloodRequest } from '../../types';
import { BloodGroupSelector } from '../../components/common/BloodGroupSelector';
import { HospitalSearchSelect } from '../../components/common/HospitalSearchSelect';

interface CreateRequestViewProps {
  onBack: () => void;
  onSuccess: (request: BloodRequest) => void;
}

export const CreateRequestView: React.FC<CreateRequestViewProps> = ({ onBack, onSuccess }) => {
  const { facilities, createBloodRequest, checkDuplicateRequest, currentUser, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [patientInitial, setPatientInitial] = useState('');
  const [bloodType, setBloodType] = useState<BloodType>('B');
  const [rhesus, setRhesus] = useState<Rhesus>('POSITIVE');
  const [componentType, setComponentType] = useState<ComponentType>('PRC');
  const [bagsNeeded, setBagsNeeded] = useState<number>(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('CRITICAL_24H');

  const [selectedHospitalId, setSelectedHospitalId] = useState(facilities[0]?.id || '');
  const [hospitalRoom, setHospitalRoom] = useState('');
  const [city, setCity] = useState(facilities[0]?.city || 'Kota Cirebon');

  // Family Companion State (Optional)
  const [hasCompanion, setHasCompanion] = useState(false);
  const [companionName, setCompanionName] = useState('');
  const [companionPhone, setCompanionPhone] = useState('');
  const [companionRelationship, setCompanionRelationship] = useState('Keluarga Inti (Suami/Istri/Anak/Orang Tua)');
  const [companionEmail, setCompanionEmail] = useState('');
  const [companionPermView, setCompanionPermView] = useState(true);
  const [companionPermChat, setCompanionPermChat] = useState(true);
  const [companionPermConfirm, setCompanionPermConfirm] = useState(false);
  const [companionConsent, setCompanionConsent] = useState(false);

  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [simulatedProofFile, setSimulatedProofFile] = useState('surat_pengantar_transfusi_resmi.pdf');
  const [useHospitalDirectVerification, setUseHospitalDirectVerification] = useState(false);
  const [hasConfirmedEthics, setHasConfirmedEthics] = useState(false);
  const [duplicateWarningAccepted, setDuplicateWarningAccepted] = useState(false);

  // Check duplicate real-time
  const duplicateCheck = checkDuplicateRequest(patientInitial, selectedHospitalId, bloodType);

  const selectedHospital = facilities.find(f => f.id === selectedHospitalId);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientInitial.trim()) {
      showToast({ type: 'warning', title: 'Data Belum Lengkap', message: 'Harap isi inisial nama pasien.' });
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalRoom.trim()) {
      showToast({ type: 'warning', title: 'Data Belum Lengkap', message: 'Harap cantumkan ruangan / bangsal pasien di rumah sakit.' });
      return;
    }

    if (hasCompanion) {
      if (!companionName.trim()) {
        showToast({ type: 'warning', title: 'Data Pendamping Belum Lengkap', message: 'Harap isi nama lengkap pendamping keluarga.' });
        return;
      }
      if (!companionPhone.trim() || companionPhone.replace(/[^0-9]/g, '').length < 9) {
        showToast({ type: 'warning', title: 'Nomor HP Pendamping Tidak Valid', message: 'Harap isi nomor HP / WhatsApp pendamping aktif (minimal 9 digit).' });
        return;
      }
      if (!companionPermView && !companionPermChat && !companionPermConfirm) {
        showToast({ type: 'warning', title: 'Hak Akses Pendamping', message: 'Pilih minimal satu hak akses untuk pendamping.' });
        return;
      }
      if (!companionConsent) {
        showToast({ type: 'warning', title: 'Persetujuan Data Pendamping', message: 'Harap centang konfirmasi izin pendaftaran data kontak pendamping.' });
        return;
      }
    }

    setStep(3);
  };

  const handleSubmitFinal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfirmedEthics) {
      showToast({ 
        type: 'warning', 
        title: 'Persetujuan Etika', 
        message: 'Mohon centang konfirmasi bahwa permohonan ini bersifat sukarela dan bebas transaksi komersial.' 
      });
      return;
    }

    if (duplicateCheck.isDuplicate && !duplicateWarningAccepted) {
      showToast({
        type: 'warning',
        title: 'Konfirmasi Duplikasi',
        message: 'Harap centang konfirmasi bahwa permohonan ini bukan duplikasi permohonan yang sudah ada.'
      });
      return;
    }

    const companionPayload = hasCompanion && companionName.trim() && companionPhone.trim() ? {
      fullName: companionName.trim(),
      phone: companionPhone.trim(),
      relationship: companionRelationship,
      email: companionEmail.trim() || undefined,
      permissions: [
        ...(companionPermView ? ['VIEW' as const] : []),
        ...(companionPermChat ? ['CHAT' as const] : []),
        ...(companionPermConfirm ? ['CONFIRM' as const] : []),
      ],
      consentGiven: companionConsent
    } : undefined;

    const newReq = createBloodRequest({
      patientIdentifier: patientInitial.trim(),
      bloodType,
      rhesus,
      componentType,
      bagsNeeded: Number(bagsNeeded),
      hospitalId: selectedHospitalId,
      hospitalRoom: hospitalRoom.trim(),
      city,
      urgency,
      diagnosisNotes: diagnosisNotes.trim() || 'Kebutuhan transfusi darurat terindikasi medis di wilayah Cirebon.',
      proofFilename: useHospitalDirectVerification 
        ? 'Verifikasi langsung di loket BDRS Rumah Sakit' 
        : simulatedProofFile,
      source: currentUser.role === 'HOSPITAL' ? 'HOSPITAL' : 'FAMILY',
      companion: companionPayload
    });

    onSuccess(newReq);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top back button & breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        {/* Stepper counter */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            1. Pasien & Darah
          </span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            2. Rumah Sakit
          </span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-rose-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
            3. Verifikasi Berkas
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step 1: Patient & Blood Spec */}
        {step === 1 && (
          <form onSubmit={handleNextStep1} className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Langkah 1: Identitas Pasien & Golongan Darah
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    currentUser.role === 'HOSPITAL' 
                      ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                  }`}>
                    {currentUser.role === 'HOSPITAL' ? 'Diajukan oleh RS' : 'Diajukan oleh Keluarga'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Gunakan nama inisial demi privasi riwayat kesehatan pasien di wilayah Kota & Kab. Cirebon.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Inisial / Nama Pasien (Sesuai Berkas RS): <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientInitial}
                  onChange={(e) => setPatientInitial(e.target.value)}
                  placeholder="Contoh: Tn. Haryono S*** (58 th)"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              {/* Custom Blood Group & Rhesus Selector */}
              <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
                <BloodGroupSelector
                  selectedBloodType={bloodType}
                  selectedRhesus={rhesus}
                  onChangeBloodType={(bt) => setBloodType(bt)}
                  onChangeRhesus={(rh) => setRhesus(rh)}
                  allowUnknown={false}
                  label="Pilih Golongan Darah Spesifik Pasien (ABO & Rhesus):"
                />
              </div>

              {/* Component & Bags Needed */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Jenis Komponen Darah:
                  </label>
                  <select
                    value={componentType}
                    onChange={(e) => setComponentType(e.target.value as ComponentType)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-rose-600 bg-white"
                  >
                    <option value="PRC">Packed Red Cells (PRC - Sel Darah Merah)</option>
                    <option value="WHOLE_BLOOD">Whole Blood (Darah Lengkap)</option>
                    <option value="THROMBOCYTE">Thrombocyte Concentrate (TC - Trombosit)</option>
                    <option value="FFP">Fresh Frozen Plasma (FFP - Plasma Segar)</option>
                    <option value="CRYOPRECIPITATE">Kriopresipitat</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-800 block mb-1">
                    Jumlah Kantong yang Dibutuhkan:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={bagsNeeded}
                    onChange={(e) => setBagsNeeded(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-rose-600"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Sesuai instruksi formulir permintaan transfusi rumah sakit.
                  </span>
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Tingkat Kedaruratan Waktu:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col ${urgency === 'CRITICAL_24H' ? 'border-rose-600 bg-rose-50/50 text-rose-900' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="urgency"
                      value="CRITICAL_24H"
                      checked={urgency === 'CRITICAL_24H'}
                      onChange={() => setUrgency('CRITICAL_24H')}
                      className="sr-only"
                    />
                    <span className="font-bold">Kritis (&lt; 24 Jam)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Operasi darurat / trauma perdarahan hebat</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col ${urgency === 'URGENT_48H' ? 'border-rose-600 bg-rose-50/50 text-rose-900' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="urgency"
                      value="URGENT_48H"
                      checked={urgency === 'URGENT_48H'}
                      onChange={() => setUrgency('URGENT_48H')}
                      className="sr-only"
                    />
                    <span className="font-bold">Mendesak (&lt; 48 Jam)</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Penurunan Hb stabil / kemoterapi</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col ${urgency === 'SCHEDULED' ? 'border-rose-600 bg-rose-50/50 text-rose-900' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input
                      type="radio"
                      name="urgency"
                      value="SCHEDULED"
                      checked={urgency === 'SCHEDULED'}
                      onChange={() => setUrgency('SCHEDULED')}
                      className="sr-only"
                    />
                    <span className="font-bold">Terjadwal</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Transfusi rutin thalassemia / operasi terencana</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Lanjut ke Lokasi Rumah Sakit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Hospital & Location (Autocomplete search) */}
        {step === 2 && (
          <form onSubmit={handleNextStep2} className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Langkah 2: Lokasi & Fasilitas Pelayanan Kesehatan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cari rumah sakit di wilayah Kota atau Kabupaten Cirebon tempat pasien dirawat.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Hospital Autocomplete Search */}
              <HospitalSearchSelect
                facilities={facilities.filter(f => f.type === 'HOSPITAL')}
                selectedHospitalId={selectedHospitalId}
                onSelectHospital={(fac) => {
                  setSelectedHospitalId(fac.id);
                  setCity(fac.city);
                }}
              />

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Ruangan / Kamar / Bangsal Pasien: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={hospitalRoom}
                  onChange={(e) => setHospitalRoom(e.target.value)}
                  placeholder="Contoh: Gedung Teratai Lantai 3, Kamar 312"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Wilayah Operasional:
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-rose-600 bg-white"
                >
                  <option value="Kota Cirebon">Kota Cirebon</option>
                  <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Operasional DONORLINK difokuskan pada jejaring fasilitas kesehatan Kota & Kabupaten Cirebon.
                </span>
              </div>

              {/* Optional Family Companion Feature */}
              <div className="pt-2">
                <div className={`p-4 rounded-2xl border transition-all ${
                  hasCompanion 
                    ? 'border-rose-300 bg-rose-50/30' 
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCompanion}
                      onChange={(e) => setHasCompanion(e.target.checked)}
                      className="mt-0.5 rounded text-rose-700 focus:ring-rose-500 w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-700" />
                        <span className="font-bold text-slate-900 text-xs">
                          Saya mengajukan permintaan darah untuk orang lain dan ingin menambahkan pendamping
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Pendamping keluarga dapat membantu memantau status transfusi dan berkoordinasi langsung dengan pendonor melalui akun mereka sendiri tanpa berbagi kata sandi akun Anda.
                      </p>
                    </div>
                  </label>

                  {hasCompanion && (
                    <div className="mt-4 pt-4 border-t border-rose-200/60 space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-800 block mb-1 text-[11px]">
                            Nama Lengkap Pendamping: <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required={hasCompanion}
                            value={companionName}
                            onChange={(e) => setCompanionName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:border-rose-600 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-800 block mb-1 text-[11px]">
                            Nomor HP / WhatsApp Pendamping: <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required={hasCompanion}
                            value={companionPhone}
                            onChange={(e) => setCompanionPhone(e.target.value)}
                            placeholder="Contoh: 0812-3456-7890"
                            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:border-rose-600 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-800 block mb-1 text-[11px]">
                            Hubungan dengan Pasien: <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={companionRelationship}
                            onChange={(e) => setCompanionRelationship(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:border-rose-600 text-xs"
                          >
                            <option value="Keluarga Inti (Suami/Istri/Anak/Orang Tua)">Keluarga Inti (Suami/Istri/Anak/Orang Tua)</option>
                            <option value="Saudara Kandung">Saudara Kandung</option>
                            <option value="Kerabat / Famili">Kerabat / Famili</option>
                            <option value="Rekan Kerja / Teman">Rekan Kerja / Teman</option>
                            <option value="Pendamping Medis / Relawan">Pendamping Medis / Relawan</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-slate-800 block mb-1 text-[11px]">
                            Email Pendamping (Opsional):
                          </label>
                          <input
                            type="email"
                            value={companionEmail}
                            onChange={(e) => setCompanionEmail(e.target.value)}
                            placeholder="pendamping@email.com"
                            className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:border-rose-600 text-xs"
                          />
                        </div>
                      </div>

                      {/* Permissions Multi-choice */}
                      <div>
                        <label className="font-semibold text-slate-800 block mb-1.5 text-[11px]">
                          Pilih Hak Akses Pendamping untuk Permohonan Ini:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 transition-colors ${
                            companionPermView ? 'border-rose-500 bg-rose-50/50 text-rose-950' : 'border-slate-200 bg-white text-slate-700'
                          }`}>
                            <input
                              type="checkbox"
                              checked={companionPermView}
                              onChange={(e) => setCompanionPermView(e.target.checked)}
                              className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                            />
                            <div>
                              <div className="flex items-center gap-1 font-bold text-[11px]">
                                <Eye className="w-3.5 h-3.5 text-rose-600" />
                                <span>Lihat Status (VIEW)</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                Memantau pergerakan kantong dan respon pendonor.
                              </p>
                            </div>
                          </label>

                          <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 transition-colors ${
                            companionPermChat ? 'border-rose-500 bg-rose-50/50 text-rose-950' : 'border-slate-200 bg-white text-slate-700'
                          }`}>
                            <input
                              type="checkbox"
                              checked={companionPermChat}
                              onChange={(e) => setCompanionPermChat(e.target.checked)}
                              className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                            />
                            <div>
                              <div className="flex items-center gap-1 font-bold text-[11px]">
                                <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                                <span>Kirim Pesan (CHAT)</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                Berkoordinasi via percakapan aman di aplikasi.
                              </p>
                            </div>
                          </label>

                          <label className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 transition-colors ${
                            companionPermConfirm ? 'border-rose-500 bg-rose-50/50 text-rose-950' : 'border-slate-200 bg-white text-slate-700'
                          }`}>
                            <input
                              type="checkbox"
                              checked={companionPermConfirm}
                              onChange={(e) => setCompanionPermConfirm(e.target.checked)}
                              className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                            />
                            <div>
                              <div className="flex items-center gap-1 font-bold text-[11px]">
                                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                                <span>Konfirmasi (CONFIRM)</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                Mengonfirmasi kehadiran relawan di RS/BDRS.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Data Consent */}
                      <div className="pt-1">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={companionConsent}
                            onChange={(e) => setCompanionConsent(e.target.checked)}
                            className="mt-0.5 rounded text-rose-700 focus:ring-rose-500"
                          />
                          <span className="text-[11px] text-slate-600 leading-snug">
                            Saya telah memperoleh izin dari pendamping bersangkutan untuk mendaftarkan nama dan nomor kontak pada sistem DONORLINK Cirebon. <span className="text-slate-400">(Akses dapat dicabut sewaktu-waktu oleh pemohon).</span>
                          </span>
                        </label>
                      </div>

                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-[10px] leading-relaxed flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Status Akun Pendamping:</strong> Jika nomor HP sudah terdaftar di DONORLINK, akses akan langsung aktif (<span className="font-semibold text-emerald-700">ACTIVE</span>). Jika belum memiliki akun, sistem mencatat status <span className="font-semibold text-amber-700">INVITED_PENDING_REGISTRATION</span> dan akses aktif otomatis saat pendamping mendaftar.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Duplicate Request Detection Warning */}
              {duplicateCheck.isDuplicate && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Peringatan Deteksi Permohonan Serupa</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Sistem mendeteksi adanya permohonan aktif untuk pasien <strong>{duplicateCheck.existingRequest?.patientIdentifier}</strong> di <strong>{duplicateCheck.existingRequest?.hospitalName}</strong> dengan golongan darah <strong>{duplicateCheck.existingRequest?.bloodType}</strong> (ID: #{duplicateCheck.existingRequest?.id}).
                  </p>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={duplicateWarningAccepted}
                      onChange={(e) => setDuplicateWarningAccepted(e.target.checked)}
                      className="rounded text-amber-700 focus:ring-amber-500"
                    />
                    <span className="text-xs font-semibold text-amber-900">
                      Saya mengonfirmasi bahwa ini adalah kebutuhan tambahan yang berbeda atau kelanjutan transfusi sah.
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Lanjut ke Verifikasi Berkas</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Verification & Medical Ethics */}
        {step === 3 && (
          <form onSubmit={handleSubmitFinal} className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Langkah 3: Lampiran Berkas & Komitmen Kemanusiaan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifikasi dapat dilakukan melalui unggahan berkas atau verifikasi langsung oleh staf BDRS rumah sakit.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Optional Transfusion Proof with direct BDRS option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-800 block">
                    Surat Permintaan Transfusi dari RS (Opsional):
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useHospitalDirectVerification}
                      onChange={(e) => setUseHospitalDirectVerification(e.target.checked)}
                      className="rounded text-rose-700 focus:ring-rose-600"
                    />
                    <span>Verifikasi langsung di loket BDRS Rumah Sakit</span>
                  </label>
                </div>

                {!useHospitalDirectVerification ? (
                  <div className="p-4 border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="font-semibold text-slate-800">
                      {simulatedProofFile}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Format: PDF, JPG, atau PNG (Opsional jika diverifikasi staf di RS)
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-emerald-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-xs">
                      Permintaan akan diverifikasi secara fisik oleh petugas BDRS {selectedHospital?.name || 'Rumah Sakit'} saat keluarga atau relawan hadir di lokasi.
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Catatan Tambahan / Diagnosa Dokter (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={diagnosisNotes}
                  onChange={(e) => setDiagnosisNotes(e.target.value)}
                  placeholder="Contoh: Pasien pasca persalinan di Cirebon dengan perdarahan, membutuhkan transfusi segera..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-rose-600 resize-none"
                />
              </div>

              {/* Ethics Agreement */}
              <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-100 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasConfirmedEthics}
                    onChange={(e) => setHasConfirmedEthics(e.target.checked)}
                    className="mt-0.5 rounded text-rose-700 focus:ring-rose-600"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Saya menyatakan bahwa data ini benar dan bersedia mematuhi prinsip donor darah sukarela murni di wilayah Cirebon (bebas jual beli darah atau calo sesuai UU Kesehatan).
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={!hasConfirmedEthics}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs ${
                  hasConfirmedEthics
                    ? 'bg-rose-700 hover:bg-rose-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Publikasikan Permohonan Darah
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
