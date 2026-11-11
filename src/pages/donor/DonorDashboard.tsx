import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Settings, 
  UserCheck, 
  Building2, 
  Syringe, 
  CreditCard,
  Ticket,
  MessageSquare,
  Award,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest, DonorProfile, DonorBooking } from '../../types';
import { RequestCard } from '../../components/common/RequestCard';
import { BrandLogo } from '../../components/common/BrandLogo';

interface DonorDashboardProps {
  onViewDetail: (request: BloodRequest) => void;
  onCommit: (request: BloodRequest) => void;
  onOpenDonorCard?: () => void;
  onOpenProfile?: () => void;
  onOpenBooking?: () => void;
  onRescheduleBooking?: (booking: DonorBooking) => void;
  onOpenChat?: (threadId?: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({
  onViewDetail,
  onCommit,
  onOpenDonorCard,
  onOpenProfile,
  onOpenBooking,
  onRescheduleBooking,
  onOpenChat
}) => {
  const { 
    currentUser, 
    currentDonorProfile, 
    updateCurrentDonorProfile, 
    toggleDonorAvailability,
    requests, 
    responses,
    donorBookings,
    cancelDonorBooking,
    getOrCreateChatThread,
    setActiveChatThreadId,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'matching' | 'voluntary' | 'commitments' | 'history' | 'profile'>('matching');
  const [editingProfile, setEditingProfile] = useState<Partial<DonorProfile>>({
    city: currentDonorProfile?.city || 'Kota Cirebon',
    district: currentDonorProfile?.district || 'Kesambi',
    weightKg: currentDonorProfile?.weightKg || 65,
    canDonatePlatelets: currentDonorProfile?.canDonatePlatelets ?? false
  });

  // Interval Calculation (60 days rule)
  const lastDonationDate = currentDonorProfile?.lastDonationDate 
    ? new Date(currentDonorProfile.lastDonationDate) 
    : null;

  const now = new Date();
  const daysSinceLast = lastDonationDate 
    ? Math.floor((now.getTime() - lastDonationDate.getTime()) / (1000 * 3600 * 24))
    : 999;

  const daysRemaining = Math.max(0, 60 - daysSinceLast);
  const isIntervalEligible = daysRemaining === 0;

  // Active donor responses (Layanan Permintaan Pasien)
  const myResponses = responses.filter(r => r.donorId === currentUser.id);
  const committedRequestIds = new Set(myResponses.map(r => r.requestId));

  // My Voluntary Bookings (Layanan Donor Sukarela PMI)
  const myBookings = donorBookings.filter(b => b.donorId === currentUser.id);
  const activeBooking = myBookings.find(b => b.status === 'BOOKED' || b.status === 'CHECKED_IN' || b.status === 'SCREENING_PASSED');

  // Matching Engine Algorithm for Donor
  const matchedRequests = requests.filter(req => {
    if (req.status === 'CLOSED_FULFILLED' || req.status === 'CLOSED_EXPIRED' || req.status === 'CANCELLED') {
      return false;
    }

    if (!currentDonorProfile) return true;

    // Blood compatibility (exact ABO match priority)
    const bloodMatch = req.bloodType === currentDonorProfile.bloodType || 
      (currentDonorProfile.bloodType === 'O' && currentDonorProfile.rhesus === req.rhesus);
    
    const rhesusMatch = req.rhesus === currentDonorProfile.rhesus;
    
    return bloodMatch && rhesusMatch;
  });

  const handleOpenChatForRequest = (reqId: string) => {
    const threadId = getOrCreateChatThread(reqId, currentUser.id);
    setActiveChatThreadId(threadId);
    if (onOpenChat) {
      onOpenChat(threadId);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentDonorProfile(editingProfile);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Profile / Readiness Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity & Blood Type */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-700 text-white flex flex-col items-center justify-center shadow-xs shrink-0">
              <span className="text-2xl font-black leading-none">
                {currentDonorProfile?.bloodType || 'O'}
              </span>
              <span className="text-xs font-mono font-bold uppercase mt-0.5">
                Rh {currentDonorProfile?.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Halo, {currentUser.fullName}
                </h2>
                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                  Pendonor Sukarela
                </span>
                {currentUser.donorIdNumber && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    ID: {currentUser.donorIdNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {currentDonorProfile?.district}, {currentDonorProfile?.city}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-mono tabular-nums text-slate-700 font-semibold">
                  Total {currentDonorProfile?.totalDonations || 0}x Donor
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>
                  Donor Terakhir: {lastDonationDate ? lastDonationDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ada'}
                </span>
              </p>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                {onOpenDonorCard && (
                  <button
                    type="button"
                    onClick={onOpenDonorCard}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                    <span>Lihat Kartu Donor Digital</span>
                  </button>
                )}
                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Profil & Peran</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Readiness Status Control */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Status Kesiapan Donor:</span>
                <span 
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    currentDonorProfile?.isAvailable && isIntervalEligible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentDonorProfile?.isAvailable && isIntervalEligible 
                    ? 'Siap Membantu' 
                    : !isIntervalEligible 
                    ? 'Masa Istirahat (60 Hari)' 
                    : 'Tidak Aktif Sementara'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5">
                {!isIntervalEligible ? (
                  <span className="text-amber-800 font-medium">
                    Sisa {daysRemaining} hari menuju interval donor berikutnya.
                  </span>
                ) : currentDonorProfile?.isAvailable ? (
                  'Anda akan menerima notifikasi jika ada pasien yang membutuhkan di sekitar Anda.'
                ) : (
                  'Pemberitahuan panggilan donor sedang dihentikan.'
                )}
              </p>
            </div>

            <button
              onClick={toggleDonorAvailability}
              disabled={!isIntervalEligible}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                !isIntervalEligible
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : currentDonorProfile?.isAvailable
                  ? 'bg-slate-800 hover:bg-slate-900 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {currentDonorProfile?.isAvailable ? 'Ubah ke Istirahat' : 'Aktifkan Kesiapan'}
            </button>
          </div>
        </div>
      </div>

      {/* DUA JALUR LAYANAN UTAMA DONOR DARAH (KOTA & KAB. CIREBON) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jalur 1: Donor Sukarela Reguler di PMI */}
        <div className={`p-5 rounded-3xl border transition-all ${
          activeTab === 'voluntary' 
            ? 'bg-red-50/50 border-red-300 ring-2 ring-red-500/20 shadow-xs' 
            : 'bg-white border-slate-200 hover:border-red-200 shadow-2xs'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-red-700 block">
                  Jalur Layanan 1
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Donor Sukarela di UTD PMI
                </h3>
              </div>
            </div>
            {activeBooking && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
                Tiket #{activeBooking.queueNumber}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            Donor rutin mandiri di UTD PMI Kota / Kab. Cirebon. Tiket antrean resmi hanya dibuat saat Anda menekan tombol "Ambil Antrean" dan mengonfirmasi.
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setActiveTab('voluntary');
              }}
              className="text-xs font-semibold text-slate-700 hover:text-red-700 cursor-pointer"
            >
              {activeBooking ? 'Lihat Status Antrean' : 'Info Kuota & Jadwal'}
            </button>
            <button
              onClick={() => {
                if (activeBooking) {
                  setActiveTab('voluntary');
                } else if (onOpenBooking) {
                  onOpenBooking();
                }
              }}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>{activeBooking ? 'Buka Tiket Antrean' : 'Ambil Antrean PMI'}</span>
            </button>
          </div>
        </div>

        {/* Jalur 2: Donor untuk Permintaan Pasien RS */}
        <div className={`p-5 rounded-3xl border transition-all ${
          activeTab === 'matching' 
            ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20 shadow-xs' 
            : 'bg-white border-slate-200 hover:border-rose-200 shadow-2xs'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-rose-700 block">
                  Jalur Layanan 2
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  Donor untuk Permintaan Pasien RS
                </h3>
              </div>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-rose-700 text-white font-bold">
              {matchedRequests.length} Cocok
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
            Permohonan darah darurat dari keluarga pasien yang telah diverifikasi RS di Cirebon. Anda dapat memeriksa kebutuhan dan menyatakan kesediaan.
          </p>
          <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Golongan: <strong className="text-slate-800">{currentDonorProfile?.bloodType}{currentDonorProfile?.rhesus === 'POSITIVE' ? '+' : '-'}</strong>
            </span>
            <button
              onClick={() => setActiveTab('matching')}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Lihat Daftar Permintaan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Distinct Two Services Quick Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'matching' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-rose-500" />
          <span>Donor untuk Permintaan Pasien RS</span>
          <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
            {matchedRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('voluntary')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'voluntary' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4 text-red-500" />
          <span>Donor Sukarela di UTD PMI</span>
          {activeBooking && (
            <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white">
              Tiket: {activeBooking.queueNumber}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('commitments')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'commitments' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Komitmen Pasien Aktif</span>
          {myResponses.length > 0 && (
            <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
              {myResponses.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Riwayat & Apresiasi Terpisah</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Domisili & Preferensi</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DONOR UNTUK PERMINTAAN PASIEN RS (LAYANAN 2) */}
      {/* ======================================================== */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
            <p>
              Menampilkan kebutuhan darah darurat yang cocok dengan golongan <strong className="text-slate-800">{currentDonorProfile?.bloodType}{currentDonorProfile?.rhesus === 'POSITIVE' ? '+' : '-'}</strong> di rumah sakit Cirebon.
            </p>
            <span className="text-[11px] font-mono text-slate-400">
              Disaring otomatis oleh Matching Engine
            </span>
          </div>

          {matchedRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Belum Ada Kebutuhan Pasien Cocok</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Saat ini belum ada permohonan darah darurat yang cocok di wilayah {currentDonorProfile?.city}. Anda juga dapat melakukan donor sukarela rutin di UTD PMI.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedRequests.map(req => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onViewDetail={onViewDetail}
                  onCommit={onCommit}
                  currentUserRole="DONOR"
                  isCommittedByCurrentUser={committedRequestIds.has(req.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DONOR SUKARELA DI UTD PMI (LAYANAN 1) */}
      {/* ======================================================== */}
      {activeTab === 'voluntary' && (
        <div className="space-y-5 text-xs">
          {/* Active Booking Ticket Card (if exists) */}
          {activeBooking ? (
            <div className="bg-gradient-to-br from-red-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-red-800/40 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-red-300 block mb-1">
                    Tiket Antrean Donor Sukarela Aktif
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {activeBooking.facilityName}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Tanggal: {activeBooking.bookingDate} · Sesi: {activeBooking.timeSlot}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/10 text-center">
                  <span className="text-[10px] text-slate-300 block uppercase font-mono">Nomor Antrean Anda</span>
                  <span className="text-3xl font-black font-mono text-white block mt-0.5">
                    {activeBooking.queueNumber}
                  </span>
                </div>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Status Proses di Lokasi:</span>
                  <span className="font-bold text-white text-sm mt-0.5 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    {activeBooking.status === 'BOOKED' ? 'Terjadwal (Silakan Check-In saat tiba)' :
                     activeBooking.status === 'CHECKED_IN' ? 'Telah Check-In (Menunggu Panggilan Skrining)' :
                     activeBooking.status === 'SCREENING_PASSED' ? 'Lolos Skrining (Bilik Pengambilan Darah Aftap)' : activeBooking.status}
                  </span>
                  {activeBooking.screeningData?.screeningNotes && (
                    <p className="text-[11px] text-slate-300 mt-1 italic">
                      "{activeBooking.screeningData.screeningNotes}"
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {activeBooking.status === 'BOOKED' && (
                    <>
                      {onRescheduleBooking && (
                        <button
                          onClick={() => onRescheduleBooking(activeBooking)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 cursor-pointer transition-colors"
                        >
                          Jadwalkan Ulang
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm(`Batalkan tiket antrean #${activeBooking.queueNumber} untuk tanggal ${activeBooking.bookingDate}?`)) {
                            cancelDonorBooking(activeBooking.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white font-semibold text-xs border border-rose-400/30 cursor-pointer transition-colors"
                      >
                        Batalkan Tiket
                      </button>
                    </>
                  )}
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300">
                    Bawa KTP & Kartu Donor saat ke UTD.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-3">
                <Ticket className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Donor Darah Reguler Langsung ke UTD PMI
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Donor sukarela murni untuk menjaga ketersediaan stok darah Kota & Kabupaten Cirebon. Pilih tanggal dan slot waktu untuk mendapatkan nomor antrean digital.
              </p>
              {onOpenBooking && (
                <button
                  onClick={onOpenBooking}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Booking Jadwal Donor Sukarela</span>
                </button>
              )}
            </div>
          )}

          {/* Guidelines info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-slate-600 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-700" />
              Ketentuan Donor Sukarela Reguler di PMI
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Donor sukarela reguler langsung masuk ke stok bank darah UTD PMI untuk kebutuhan transfusi masyarakat luas.</li>
              <li>Jeda minimal antar donor Whole Blood adalah 60 hari untuk keselamatan fisik Anda.</li>
              <li>Pemeriksaan fisik (kadar hemoglobin & tekanan darah) dilakukan langsung di bilik periksa UTD sebelum pengambilan darah.</li>
            </ul>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KOMITMEN PASIEN AKTIF & CHAT KELUARGA */}
      {/* ======================================================== */}
      {activeTab === 'commitments' && (
        <div className="space-y-4 text-xs">
          {myResponses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-md mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Tidak Ada Komitmen Permintaan Pasien</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Anda belum menyatakan komitmen untuk permohonan donor tertentu. Buka tab <strong>Donor untuk Permintaan Pasien</strong> untuk menanggapi keluarga yang sedang membutuhkan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myResponses.map(resp => {
                const req = requests.find(r => r.id === resp.requestId);
                return (
                  <div 
                    key={resp.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          Komitmen Kehadiran Terdaftar
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: #{resp.requestId}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">
                        {req ? req.hospitalName : 'Rumah Sakit Terkait'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Pasien: <strong className="text-slate-800">{req?.patientIdentifier}</strong> · Ruang: {req?.hospitalRoom} ({req?.city})
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Estimasi Waktu Tiba Anda: <strong className="text-slate-800">{resp.etaDescription}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenChatForRequest(resp.requestId)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Buka Chat dengan Keluarga</span>
                      </button>

                      {req && (
                        <button
                          onClick={() => onViewDetail(req)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Detail Permohonan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RIWAYAT TERPISAH (DONOR SUKARELA VS PASIEN) */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Box A: Riwayat Donor Sukarela Reguler di PMI */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-700" />
                <h4 className="font-bold text-sm text-slate-900">
                  1. Riwayat Donor Sukarela Reguler di UTD PMI
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Total: {currentDonorProfile?.totalDonations || 0}x</span>
            </div>

            <div className="space-y-3">
              {myBookings.filter(b => b.status === 'DONATION_COMPLETED').length === 0 ? (
                <p className="text-slate-500 text-xs italic py-4 text-center">
                  Belum ada riwayat donor sukarela reguler yang tercatat selesai di UTD PMI.
                </p>
              ) : (
                myBookings.filter(b => b.status === 'DONATION_COMPLETED').map(b => (
                  <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{b.facilityName}</span>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        Tanggal: {b.bookingDate} · Hb: {b.screeningData?.hbLevel || '13.5'} g/dL
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Berhasil 1 Kantong
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Box B: Riwayat Tanggapan Donor Permintaan Pasien RS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-700" />
                <h4 className="font-bold text-sm text-slate-900">
                  2. Riwayat Komitmen Pasien Darurat RS
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Total: {myResponses.length}x</span>
            </div>

            <div className="space-y-3">
              {myResponses.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-4 text-center">
                  Belum ada riwayat komitmen donor untuk permintaan pasien spesifik di rumah sakit.
                </p>
              ) : (
                myResponses.map(r => {
                  const req = requests.find(reqItem => reqItem.id === r.requestId);
                  return (
                    <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">{req?.patientIdentifier || 'Pasien RS'}</span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {req?.hospitalName} ({req?.city})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Terkonfirmasi Hadir
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PENGATURAN DOMISILI & PROFIL */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-xl shadow-xs">
          <h4 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
            Pengaturan Profil & Domisili Donor
          </h4>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kota / Kabupaten Domisili:</label>
              <select
                value={editingProfile.city}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="Kota Cirebon">Kota Cirebon</option>
                <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kecamatan:</label>
              <input
                type="text"
                value={editingProfile.district}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, district: e.target.value }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Berat Badan (Kg):</label>
              <input
                type="number"
                min="40"
                max="150"
                value={editingProfile.weightKg}
                onChange={(e) => setEditingProfile(prev => ({ ...prev, weightKg: Number(e.target.value) }))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Syarat minimal donor darah adalah 45 kg (Whole Blood) atau 55 kg (Apheresis).
              </span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProfile.canDonatePlatelets}
                  onChange={(e) => setEditingProfile(prev => ({ ...prev, canDonatePlatelets: e.target.checked }))}
                  className="rounded text-rose-700 focus:ring-rose-600"
                />
                <span className="font-semibold text-slate-800">
                  Bersedia dihubungi untuk donor Apheresis (Trombosit Konsentrat)
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
