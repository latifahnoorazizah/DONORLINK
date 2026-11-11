import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Clock, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Share2,
  Flag,
  ArrowRight,
  HeartHandshake,
  Settings,
  MessageSquare,
  UserPlus,
  Archive,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';

interface RequesterDashboardProps {
  onCreateRequest: () => void;
  onViewDetail: (request: BloodRequest) => void;
  onOpenReportAbuse: (request: BloodRequest) => void;
  onSwitchToDonor?: () => void;
  onOpenProfile?: () => void;
  onOpenChat?: (threadId?: string) => void;
  onManageCompanions?: (request: BloodRequest) => void;
}

export const RequesterDashboard: React.FC<RequesterDashboardProps> = ({
  onCreateRequest,
  onViewDetail,
  onOpenReportAbuse,
  onSwitchToDonor,
  onOpenProfile,
  onOpenChat,
  onManageCompanions
}) => {
  const { 
    currentUser, 
    requests, 
    responses, 
    updateRequestStatus, 
    showToast,
    getOrCreateChatThread,
    setActiveChatThreadId 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');

  // Find requests belonging to this requester or where user is a family companion
  const myRequests = requests.filter(r => 
    r.requesterId === currentUser.id || 
    (r.familyCompanions && r.familyCompanions.some(fc => fc.phone === currentUser.phone))
  );

  const activeRequests = myRequests.filter(r => r.status === 'OPEN' || r.status === 'PARTIALLY_FULFILLED');
  const archivedRequests = myRequests.filter(r => r.status === 'CLOSED_FULFILLED' || r.status === 'CLOSED_EXPIRED' || r.status === 'CANCELLED');

  const displayedRequests = activeTab === 'active' ? activeRequests : archivedRequests;

  const handleMarkFulfilled = (requestId: string) => {
    updateRequestStatus(requestId, 'CLOSED_FULFILLED');
    showToast({
      type: 'success',
      title: 'Permohonan Selesai',
      message: 'Status permohonan telah ditutup. Terima kasih kepada seluruh relawan yang telah berpartisipasi.'
    });
  };

  const handleOpenChat = (reqId: string) => {
    const threadId = getOrCreateChatThread(reqId, currentUser.id);
    setActiveChatThreadId(threadId);
    if (onOpenChat) {
      onOpenChat(threadId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <BrandLogo variant="badge" className="w-14 h-14" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Dashboard Pencari Donor
              </h2>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                Keluarga Pasien
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Narahubung Utama: <strong className="text-slate-800">{currentUser.fullName}</strong> ({currentUser.phone}) · Wilayah: Kota & Kab. Cirebon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenProfile && (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Edit Profil</span>
            </button>
          )}

          <button
            onClick={onCreateRequest}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Permohonan Darah Baru</span>
          </button>
        </div>
      </div>

      {/* Dual capability helper alert */}
      {currentUser.isDonorEnabled && onSwitchToDonor && (
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-rose-700 shrink-0" />
            <span className="text-rose-900">
              Akun Anda juga terdaftar sebagai <strong>Pendonor Sukarela</strong>. Anda dapat menerima panggilan donor sewaktu-waktu.
            </span>
          </div>
          <button
            onClick={onSwitchToDonor}
            className="text-rose-700 hover:text-rose-900 font-bold underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <span>Buka Mode Pendonor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tabs: Permohonan Aktif vs Arsip */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'active' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4 text-rose-500" />
          <span>Permohonan Aktif</span>
          <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
            {activeRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'archive' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Archive className="w-4 h-4 text-slate-400" />
          <span>Arsip Permohonan Terpenuhi / Selesai</span>
          <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
            {archivedRequests.length}
          </span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayedRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
              {activeTab === 'active' ? <Users className="w-6 h-6" /> : <Archive className="w-6 h-6" />}
            </div>
            <h3 className="font-bold text-base text-slate-900">
              {activeTab === 'active' ? 'Belum Ada Permohonan Darah Aktif' : 'Arsip Permohonan Masih Kosong'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {activeTab === 'active' 
                ? 'Jika anggota keluarga Anda sedang membutuhkan darah di rumah sakit wilayah Cirebon, ajukan permohonan dengan mencantumkan nomor RM dan dokter penanggung jawab.'
                : 'Permohonan yang telah terpenuhi seluruh kantongnya atau ditutup akan tersimpan rapi di tab arsip ini.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={onCreateRequest}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Buat Permohonan Sekarang
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedRequests.map(req => {
              const matchedResponses = responses.filter(r => r.requestId === req.id);
              const percent = Math.min(100, Math.round((req.bagsFulfilled / req.bagsNeeded) * 100));
              const isClosed = req.status === 'CLOSED_FULFILLED' || req.status === 'CLOSED_EXPIRED' || req.status === 'CANCELLED';
              const companionsCount = req.familyCompanions ? req.familyCompanions.length : 0;
              const receivedBagsCount = req.receivedBagsLog ? req.receivedBagsLog.length : 0;

              return (
                <div 
                  key={req.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-xs transition-all ${
                    isClosed ? 'border-slate-200 opacity-85' : 'border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left: Request Identity */}
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                        <span className="font-mono font-semibold text-slate-800">ID #{req.id}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        {/* Request Source Tag */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.source === 'HOSPITAL' 
                            ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}>
                          {req.source === 'HOSPITAL' ? 'Diajukan oleh Rumah Sakit' : 'Diajukan oleh Keluarga'}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{req.city}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-medium text-slate-800">
                          {req.verificationStatus === 'VERIFIED_BY_HOSPITAL' ? (
                            <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Terverifikasi Staf RS
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Menunggu Verifikasi BDRS
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col items-center justify-center shrink-0">
                          <span className="text-2xl font-black leading-none">{req.bloodType}</span>
                          <span className="text-[10px] font-mono font-bold mt-0.5">
                            Rh {req.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900">{req.patientIdentifier}</h4>
                          <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {req.hospitalName} ({req.hospitalRoom})
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Komponen: <strong className="text-slate-700">{req.componentType}</strong> · Tingkat Urgensi: <strong className="text-slate-700">{req.urgency}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar & Bags Count */}
                      <div className="pt-2 max-w-md">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700">Progres Pemenuhan Kantong Darah:</span>
                          <span className="font-mono tabular-nums font-bold text-slate-900">
                            {req.bagsFulfilled} / {req.bagsNeeded} Kantong
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${percent >= 100 ? 'bg-emerald-600' : 'bg-rose-600'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {receivedBagsCount > 0 && (
                          <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {receivedBagsCount} kantong darah telah diterima & diverifikasi oleh BDRS {req.hospitalName}.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Family Companions & Quick Info */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {onManageCompanions && (
                          <button
                            type="button"
                            onClick={() => onManageCompanions(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                            <span>Pendamping Keluarga ({companionsCount})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenChat(req.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                          <span>Chat Relawan & Faskes</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Committed Volunteers Box */}
                    <div className="lg:w-80 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-500" />
                          Relawan Merespons ({matchedResponses.length})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Status Terkini</span>
                      </div>

                      {matchedResponses.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          Belum ada relawan yang mengonfirmasi kehadiran. Sistem terus memindai pendonor yang cocok di Cirebon.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {matchedResponses.map(resp => (
                            <div key={resp.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-slate-900">{resp.donorName}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-bold">
                                  Gol {resp.donorBloodType}{resp.donorRhesus === 'POSITIVE' ? '+' : '-'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-1">
                                Waktu Tiba: <strong>{resp.etaDescription}</strong>
                              </p>
                              {resp.notes && (
                                <p className="text-[10px] text-slate-400 mt-0.5 italic">
                                  "{resp.notes}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                        <button
                          onClick={() => onViewDetail(req)}
                          className="flex-1 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer text-center"
                        >
                          Lihat Detail
                        </button>
                        {!isClosed && (
                          <button
                            onClick={() => handleMarkFulfilled(req.id)}
                            className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg text-xs cursor-pointer"
                          >
                            Tutup (Terpenuhi)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Emergency Fallback Guidance */}
      <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <PhoneCall className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-amber-950 block">
            Jalur Alternatif Darurat PMI & Bank Darah Rumah Sakit
          </strong>
          <p className="leading-relaxed">
            Jika kondisi pasien sangat mendesak dan belum ada relawan yang merespons dalam beberapa jam, keluarga disarankan berkoordinasi langsung dengan <strong>Bank Darah Rumah Sakit (BDRS)</strong> tempat pasien dirawat untuk mengajukan permohonan droping darah antar-UTD PMI resmi (UTD PMI Kota Cirebon atau UTD PMI Kabupaten Cirebon).
          </p>
        </div>
      </div>
    </div>
  );
};
