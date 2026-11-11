import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  FileText, 
  Phone, 
  CheckCircle2, 
  X,
  Lock,
  Flag,
  Share2,
  MessageSquare,
  PackageCheck,
  UserCheck,
  Activity,
  History,
  Layers
} from 'lucide-react';
import { BloodRequest, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface RequestDetailModalProps {
  request: BloodRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCommitment: (request: BloodRequest) => void;
  onOpenReportAbuse: (request: BloodRequest) => void;
  onOpenChat?: (request: BloodRequest) => void;
  onOpenBagReceipt?: (request: BloodRequest) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onOpenCommitment,
  onOpenReportAbuse,
  onOpenChat,
  onOpenBagReceipt
}) => {
  const { 
    currentUser, 
    responses, 
    verifyRequestByHospital, 
    updateRequestStatus, 
    cancelDonorResponse,
    showToast,
    getOrCreateChatThread,
    setActiveChatThreadId,
    revokeFamilyCompanion
  } = useApp();

  const [verificationNoteInput, setVerificationNoteInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'timeline' | 'bags' | 'volunteers' | 'companions'>('info');

  if (!isOpen || !request) return null;

  // Filter responses matching this request
  const matchedResponses = responses.filter(r => r.requestId === request.id);
  const userResponse = matchedResponses.find(r => r.donorId === currentUser.id);

  const isHospitalForThis = currentUser.role === 'HOSPITAL';
  const isRequesterForThis = currentUser.id === request.requesterId || currentUser.role === 'REQUESTER';
  const isAdmin = currentUser.role === 'ADMIN';

  const handleVerify = () => {
    verifyRequestByHospital(request.id, verificationNoteInput || undefined);
  };

  const handleCloseRequest = (status: 'CLOSED_FULFILLED' | 'CANCELLED') => {
    updateRequestStatus(request.id, status);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `[DONORLINK] Kebutuhan Darah Golongan ${request.bloodType}${request.rhesus === 'POSITIVE' ? '+' : '-'} (${request.componentType}) untuk ${request.patientIdentifier} di ${request.hospitalName}, ${request.city}. No Permohonan: #${request.id}. Info: ${window.location.origin}`
      );
      showToast({
        type: 'success',
        title: 'Tautan Tersalin',
        message: 'Teks permohonan telah disalin ke clipboard untuk disebarkan secara aman.'
      });
    }
  };

  const handleStartChat = () => {
    const threadId = getOrCreateChatThread(request.id, currentUser.id);
    setActiveChatThreadId(threadId);
    if (onOpenChat) {
      onOpenChat(request);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-6 max-h-[92vh] flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
                <span className="font-mono font-bold text-slate-800">#{request.id}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                {/* Source badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  request.source === 'HOSPITAL' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                }`}>
                  {request.source === 'HOSPITAL' ? 'Diajukan oleh Rumah Sakit' : 'Diajukan oleh Keluarga'}
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span>Dibuat: {new Date(request.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Detail Permohonan Darah Pasien
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation within modal */}
          <div className="flex items-center gap-1.5 border-b border-slate-100 py-2.5 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('info')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubTab === 'info' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Info Kebutuhan
            </button>
            <button
              onClick={() => setActiveSubTab('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'timeline' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Timeline Permohonan ({request.timeline ? request.timeline.length : 1})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('volunteers')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'volunteers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Relawan ({matchedResponses.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('bags')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'bags' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Kantong Diterima ({request.bagsFulfilled}/{request.bagsNeeded})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('companions')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'companions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Pendamping ({request.familyCompanions ? request.familyCompanions.length : 0})</span>
            </button>
          </div>

          <div className="overflow-y-auto max-h-[55vh] pr-1 mt-4 space-y-4">
            {/* SUBTAB 1: INFO UTAMA */}
            {activeSubTab === 'info' && (
              <div className="space-y-4">
                {/* Blood Type & Vital Spec */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-700 text-white flex flex-col items-center justify-center shadow-xs">
                      <span className="text-2xl font-black leading-none">{request.bloodType}</span>
                      <span className="text-[11px] font-mono font-semibold uppercase mt-0.5">
                        Rh {request.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{request.patientIdentifier}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Komponen: <strong className="text-slate-800">{request.componentType}</strong>
                      </p>
                      <p className="text-xs text-slate-500">
                        Kebutuhan: <strong className="text-slate-800 tabular-nums">{request.bagsNeeded} Kantong</strong> (Tercatat: {request.bagsFulfilled} terpenuhi)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 shadow-2xs">
                      {request.urgency === 'CRITICAL_24H' ? 'Kritis 24 Jam' : request.urgency === 'URGENT_48H' ? 'Darurat 48 Jam' : 'Terjadwal'}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1.5 font-mono">
                      Kedaluwarsa: {new Date(request.expiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </p>
                  </div>
                </div>

                {/* Hospital & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 font-medium block">Fasilitas Pelayanan Kesehatan</span>
                    <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{request.hospitalName}</span>
                    <span className="text-slate-600 mt-0.5 block">{request.city} · Ruang: {request.hospitalRoom}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="text-slate-500 font-medium block">Status Verifikasi</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      {request.verificationStatus === 'VERIFIED_BY_HOSPITAL' ? (
                        <span className="text-emerald-800 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" />
                          Terverifikasi Staf Rumah Sakit
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Belum Diverifikasi Faskes
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {request.verificationNotes || 'Dokumen sedang dalam antrean verifikasi BDRS.'}
                    </p>
                  </div>
                </div>

                {/* Clinical Note / Diagnosis */}
                {request.diagnosisNotes && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                    <h5 className="text-xs font-semibold text-slate-800 mb-1">Catatan Diagnosa & Kebutuhan Khusus:</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{request.diagnosisNotes}</p>
                  </div>
                )}

                {/* Family Companions list if any */}
                {request.familyCompanions && request.familyCompanions.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                    <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-500" />
                      Pendamping Keluarga yang Diberi Kuasa ({request.familyCompanions.length})
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {request.familyCompanions.map(fc => (
                        <div key={fc.id} className="p-2.5 rounded-lg bg-white border border-slate-200">
                          <span className="font-semibold text-slate-800 block">{fc.fullName}</span>
                          <span className="text-[11px] text-slate-500 block">Hubungan: {fc.relationship} · {fc.phone}</span>
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-1 inline-block font-medium">
                            Izin: {fc.permissions.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/60 flex items-start gap-2.5 text-xs text-blue-900">
                  <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-800">Privasi & Keamanan Kontak Terjaga</span>
                    <p className="text-blue-700/90 text-[11px] mt-0.5">
                      Nomor telepon pemohon ({request.requesterPhone.slice(0, 4)}*****) disamarkan dari publik guna mencegah tindak penipuan calo darah. Komunikasi aman tersedia via Chat Dalam Aplikasi.
                    </p>
                  </div>
                </div>

                {/* Hospital Staff Action Box */}
                {isHospitalForThis && request.verificationStatus !== 'VERIFIED_BY_HOSPITAL' && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs">
                    <h5 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      Kewenangan Verifikasi Staf Rumah Sakit
                    </h5>
                    <p className="text-amber-800 mb-3">
                      Pastikan formulir permintaan darah telah diverifikasi sesuai rekam medis pasien.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={verificationNoteInput}
                        onChange={(e) => setVerificationNoteInput(e.target.value)}
                        placeholder="Catatan verifikasi BDRS (opsional)..."
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        onClick={handleVerify}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold cursor-pointer"
                      >
                        Verifikasi Sah
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: TIMELINE PERMOHONAN */}
            {activeSubTab === 'timeline' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Rekam jejak setiap status perubahan permohonan darah pasien:
                </p>

                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
                  {(request.timeline || []).map((ev, idx) => (
                    <div key={ev.id || idx} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-rose-600 ring-4 ring-white"></span>
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900">{ev.title}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(ev.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}, {new Date(ev.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-0.5">
                          {ev.description}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Oleh: <strong className="text-slate-700">{ev.actorName}</strong> ({ev.actorRole})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUBTAB 3: RELAWAN MERESPONS */}
            {activeSubTab === 'volunteers' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Daftar calon pendonor yang telah menyatakan kesediaan:</span>
                  <span className="font-mono">{matchedResponses.length} Relawan</span>
                </div>

                {matchedResponses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center bg-slate-50 rounded-2xl">
                    Belum ada relawan yang mengonfirmasi kesediaan. Permohonan masih disiarkan ke pendonor sekitar.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {matchedResponses.map(resp => (
                      <div 
                        key={resp.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{resp.donorName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100/70 text-rose-800 font-bold">
                              Gol {resp.donorBloodType}{resp.donorRhesus === 'POSITIVE' ? '+' : '-'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            Estimasi Kedatangan: <strong className="text-slate-700">{resp.etaDescription}</strong>
                          </p>
                          {resp.notes && (
                            <p className="text-slate-500 text-[11px] mt-0.5 italic">"{resp.notes}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {resp.donorId === currentUser.id && (
                            <button
                              onClick={() => cancelDonorResponse(resp.id)}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline cursor-pointer"
                            >
                              Batalkan
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 4: KANTONG DARAH DITERIMA */}
            {activeSubTab === 'bags' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Log Kantong Darah Resmi Terverifikasi BDRS ({request.bagsFulfilled} / {request.bagsNeeded} Kantong)
                  </span>
                  {isHospitalForThis && onOpenBagReceipt && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBagReceipt(request);
                      }}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      + Catat Penerimaan Kantong
                    </button>
                  )}
                </div>

                {(!request.receivedBagsLog || request.receivedBagsLog.length === 0) ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center bg-slate-50 rounded-2xl">
                    Belum ada kantong darah yang dicatat diterima oleh staf laboratorium rumah sakit.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {request.receivedBagsLog.map(bag => (
                      <div key={bag.id} className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-emerald-950 font-mono">No. Seri: {bag.bagSerialNumber}</span>
                            <span className="text-[11px] text-emerald-800 block mt-0.5">
                              Pendonor / Lab: {bag.donorNameOrLab} ({bag.componentType})
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {new Date(bag.receivedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-700 mt-1">
                          Diverifikasi oleh: {bag.verifiedBy} {bag.labNotes ? `· ${bag.labNotes}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 5: PENDAMPING KELUARGA */}
            {activeSubTab === 'companions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    Daftar Pendamping Keluarga Pasien
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {request.familyCompanions?.length || 0} Pendamping
                  </span>
                </div>

                {(!request.familyCompanions || request.familyCompanions.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">Belum Ada Pendamping Terdaftar</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Pemohon dapat menambahkan pendamping keluarga saat membuat permohonan darah untuk memantau status atau berkoordinasi dengan pendonor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {request.familyCompanions.map(comp => (
                      <div 
                        key={comp.id}
                        className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          comp.status === 'REVOKED'
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{comp.fullName}</span>
                            <span className="text-[11px] text-slate-500">({comp.relationship})</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                              comp.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : comp.status === 'REVOKED'
                                ? 'bg-slate-100 text-slate-500 border border-slate-200 line-through'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {comp.status === 'ACTIVE' 
                                ? 'AKUN AKTIF' 
                                : comp.status === 'REVOKED'
                                ? 'AKSES DICABUT'
                                : 'MENUNGGU REGISTRASI'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                            <span>Kontak: <strong className="text-slate-700">{currentUser.id === request.requesterId ? comp.phone : comp.phone.replace(/(\d{4})\d{4}(\d+)/, '$1-****-$2')}</strong></span>
                            {comp.email && <span>• Email: {comp.email}</span>}
                          </div>

                          {/* Permissions */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">Izin:</span>
                            {comp.permissions.map(p => (
                              <span key={p} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {p === 'VIEW' ? 'LIHAT STATUS' : p === 'CHAT' ? 'KIRIM PESAN' : 'KONFIRMASI'}
                              </span>
                            ))}
                          </div>
                        </div>

                        {currentUser.id === request.requesterId && comp.status !== 'REVOKED' && (
                          <button
                            onClick={() => revokeFamilyCompanion(request.id, comp.id)}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                          >
                            Cabut Hak Akses
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Bagikan Info Aman
            </button>

            <button
              onClick={() => onOpenReportAbuse(request)}
              className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              Laporkan Kejanggalan
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct In-App Chat trigger */}
            <button
              onClick={() => {
                onClose();
                handleStartChat();
              }}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
              <span>Buka Chat Permohonan</span>
            </button>

            {currentUser.role === 'DONOR' && request.status !== 'CLOSED_FULFILLED' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCommitment(request);
                }}
                disabled={Boolean(userResponse)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  userResponse 
                    ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                    : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                }`}
              >
                {userResponse ? 'Anda Telah Berkomitmen' : 'Saya Bersedia Membantu Donor'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
