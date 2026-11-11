import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Flag, 
  Users, 
  FileText, 
  Check, 
  X, 
  Search, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { AdministrativeReportModal } from '../../components/modals/AdministrativeReportModal';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    allUsers, 
    facilities, 
    verifyFacility, 
    rejectFacility,
    abuseReports, 
    updateAbuseReport,
    resolveAbuseReport, 
    auditLogs, 
    requests,
    resetAllData 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'facilities' | 'reports' | 'audit' | 'users'>('facilities');
  const [auditSearch, setAuditSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<'ALL' | 'NEW_TEST' | 'DEMO' | 'PENDING'>('ALL');
  const [adminNotesDrafts, setAdminNotesDrafts] = useState<Record<string, string>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const pendingFacilities = facilities.filter(f => !f.isVerified);
  const activeReportsCount = abuseReports.filter(r => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW').length;

  const filteredReports = abuseReports.filter(r => {
    if (reportStatusFilter === 'ALL') return true;
    return r.status === reportStatusFilter;
  });

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <BrandLogo variant="badge" className="w-14 h-14" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Pusat Kontrol Administrator DONORLINK
              </h2>
              <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pengelola: <strong className="text-slate-800">{currentUser.fullName}</strong> ({currentUser.email}) · Pengawasan Integritas & Kepatuhan Platform
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span>Unduh Laporan Rekapitulasi (PDF)</span>
          </button>

          <button
            onClick={resetAllData}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Total Pengguna Terdaftar</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {allUsers.length} Akun
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Faskes Terdaftar Resmi</span>
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
            {facilities.length} Institusi
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Verifikasi Faskes Tertunda</span>
          <span className={`text-2xl font-bold font-mono tabular-nums mt-1 block ${pendingFacilities.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {pendingFacilities.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-slate-500 font-medium block">Tiket Pengaduan Masuk</span>
          <span className={`text-2xl font-bold font-mono tabular-nums mt-1 block ${activeReportsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {activeReportsCount} Tiket Aktif
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'facilities' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Verifikasi Fasilitas Kesehatan</span>
          {pendingFacilities.length > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white">
              {pendingFacilities.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Moderasi Pengaduan & Laporan ({activeReportsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'audit' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Log Sistem ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Daftar Pengguna & Role
        </button>
      </div>

      {/* Tab 1: Facilities Verification */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          {/* Subheader info for lecturer testing */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
            <Building2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold block">Pemeriksaan & Validasi Legalitas Fasilitas Kesehatan</span>
              <p className="text-blue-800 text-[11px]">
                Seluruh akun Rumah Sakit (BDRS) dan UTD PMI yang mendaftar publik harus diverifikasi izin operasionalnya oleh Super Admin sebelum dapat mengonfirmasi transfusi darah atau mengelola stok kantong darah.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Daftar Fasilitas Pelayanan Darah (BDRS & UTD PMI)</span>
                <span className="text-slate-500 text-[11px]">Wilayah Operasional: Kota Cirebon & Kabupaten Cirebon</span>
              </div>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
                {facilities.length} Institusi Terdaftar · {pendingFacilities.length} Tertunda
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {facilities.map(fac => (
                <div 
                  key={fac.id} 
                  className={`p-4 transition-colors ${
                    !fac.isVerified ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-slate-900">{fac.name}</h4>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          fac.type === 'HOSPITAL' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {fac.type === 'HOSPITAL' ? 'Rumah Sakit (BDRS)' : 'UTD PMI'}
                        </span>

                        {fac.isDemoData === false ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                            UJI COBA BARU
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            DEMO SIMULASI
                          </span>
                        )}

                        {!fac.isVerified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            MENUNGGU VERIFIKASI ADMIN
                          </span>
                        )}
                      </div>

                      <div className="text-slate-600 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span><strong>Izin Operasional:</strong> <span className="font-mono font-semibold text-slate-800">{fac.permitNumber || 'DINKES/CRB-2026/001'}</span></span>
                        <span><strong>PIC:</strong> {fac.picName || 'Penanggung Jawab Faskes'} {fac.picPhone && `(${fac.picPhone})`}</span>
                        <span><strong>Hotline:</strong> {fac.phone}</span>
                      </div>

                      <p className="text-slate-500 text-[11px]">
                        {fac.address} · {fac.city} · Jam Layanan: {fac.operationHours}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {fac.isVerified ? (
                        <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          Terverifikasi Sah
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => verifyFacility(fac.id)}
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui & Verifikasi Faskes</span>
                          </button>
                          <button
                            onClick={() => rejectFacility(fac.id, 'Dokumen perizinan tidak lengkap / tidak valid')}
                            className="px-3 py-2 border border-rose-300 hover:bg-rose-50 text-rose-700 font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1 text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Abuse Reports Moderation */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Filter Status:</span>
            {[
              { id: 'ALL', label: 'Semua Tiket' },
              { id: 'SUBMITTED', label: 'Baru Diajukan' },
              { id: 'IN_REVIEW', label: 'Sedang Investigasi' },
              { id: 'ACTION_TAKEN', label: 'Tindakan Diberikan' },
              { id: 'REJECTED', label: 'Ditolak' },
              { id: 'CLOSED', label: 'Selesai / Ditutup' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setReportStatusFilter(f.id)}
                className={`px-3 py-1 rounded-xl font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  reportStatusFilter === f.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Tidak ada tiket laporan atau pengaduan untuk filter status ini.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map(rep => {
                const draftNotes = adminNotesDrafts[rep.id] ?? (rep.adminNotes || '');
                const isResolved = rep.status === 'CLOSED' || rep.status === 'REJECTED';

                return (
                  <div key={rep.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            {rep.ticketNumber || `TIK-CRB-2026-${rep.id.slice(-3)}`}
                          </span>
                          <span className="font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px]">
                            {rep.reason === 'SUSPICIOUS_REQUEST' ? 'Permintaan Palsu / Indikasi Penipuan' :
                             rep.reason === 'FAKE_ACCOUNT' ? 'Akun Palsu / Tidak Valid' :
                             rep.reason === 'CONTACT_MISUSE' ? 'Penyalahgunaan Kontak / Spam' :
                             (rep.reason as string) === 'BLOOD_COMMERCIALIZATION' || rep.reason === 'COMMERCIAL_SELLING' ? 'Jual Beli Darah / Calo' :
                             (rep.reason as string) === 'SERVICE_ISSUE' ? 'Masalah Pelayanan Faskes/UTD' :
                             (rep.reason as string) === 'SYSTEM_ISSUE' ? 'Gangguan Sistem / Bug' :
                             rep.reason === 'DATA_PRIVACY_BREACH' ? 'Pelanggaran Privasi Data' :
                             rep.reason === 'SUSPECTED_SCAM' ? 'Indikasi Modus Minta Uang' : rep.reason}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1.5">{rep.targetPatientOrTitle}</h4>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Pelapor: <strong className="text-slate-700">{rep.reporterName}</strong> · Tanggal: {new Date(rep.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start ${
                        rep.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        rep.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                        rep.status === 'ACTION_TAKEN' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                        rep.status === 'REJECTED' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {rep.status === 'SUBMITTED' ? 'Baru Diajukan' :
                         rep.status === 'IN_REVIEW' ? 'Sedang Diinvestigasi' :
                         rep.status === 'ACTION_TAKEN' ? 'Tindakan Sanksi Diberikan' :
                         rep.status === 'REJECTED' ? 'Laporan Ditolak' : 'Tiket Ditutup'}
                      </span>
                    </div>

                    {/* Report Description */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Kronologi / Keterangan dari Pelapor:
                      </span>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                        {rep.description}
                      </p>
                    </div>

                    {/* Admin Moderation Notes */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 block">
                        Catatan Moderator & Investigasi Admin:
                      </label>
                      <input
                        type="text"
                        value={draftNotes}
                        onChange={(e) => setAdminNotesDrafts({ ...adminNotesDrafts, [rep.id]: e.target.value })}
                        placeholder="Tuliskan temuan investigasi, bukti konfirmasi faskes, atau alasan putusan..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                      />
                    </div>

                    {rep.actionTakenDetails && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 font-mono">
                        Tindakan Terverifikasi: {rep.actionTakenDetails}
                      </div>
                    )}

                    {/* Action Buttons Workflow */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                      {rep.status === 'SUBMITTED' && (
                        <button
                          onClick={() => updateAbuseReport(rep.id, 'IN_REVIEW', draftNotes || 'Investigasi tim moderasi dimulai')}
                          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold cursor-pointer"
                        >
                          Mulai Investigasi
                        </button>
                      )}

                      {rep.status === 'IN_REVIEW' && (
                        <>
                          <button
                            onClick={() => updateAbuseReport(rep.id, 'ACTION_TAKEN', draftNotes || 'Terbukti melanggar aturan donor', 'Permohonan dibekukan dan nomor kontak dimasukkan ke daftar pencegahan')}
                            className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold cursor-pointer"
                          >
                            Tindak Lanjuti (Beri Sanksi)
                          </button>
                          <button
                            onClick={() => updateAbuseReport(rep.id, 'REJECTED', draftNotes || 'Laporan tidak terbukti setelah verifikasi faskes')}
                            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer"
                          >
                            Tolak Laporan
                          </button>
                        </>
                      )}

                      {(rep.status === 'ACTION_TAKEN' || rep.status === 'IN_REVIEW') && (
                        <button
                          onClick={() => updateAbuseReport(rep.id, 'CLOSED', draftNotes || 'Kasus pengaduan telah diselesaikan')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold cursor-pointer"
                        >
                          Tutup Tiket Kasus
                        </button>
                      )}

                      {isResolved && (
                        <span className="text-[11px] font-mono text-slate-500 italic">
                          Tiket ini telah selesai diproses.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: System Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between gap-4">
            <h4 className="font-bold text-sm text-slate-900">Rekam Jejak Transaksi & Akses Data (Audit Trail)</h4>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Cari aksi, aktor, atau entitas..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Aktor</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Aksi Sistem</th>
                  <th className="py-2.5 px-3">Keterangan Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/60 font-mono text-[11px]">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                      {log.actorName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-rose-800">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Users & Roles */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Kategori Akun:</span>
            {[
              { id: 'ALL', label: `Semua Akun (${allUsers.length})` },
              { id: 'NEW_TEST', label: `Uji Coba Baru (${allUsers.filter(u => u.isDemoData === false).length})` },
              { id: 'DEMO', label: `Demo Simulasi (${allUsers.filter(u => u.isDemoData !== false).length})` },
              { id: 'PENDING', label: `Menunggu Verifikasi (${allUsers.filter(u => u.status === 'PENDING_VERIFICATION').length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setUserFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  userFilter === f.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Pengguna</th>
                    <th className="py-3 px-4">Tipe Data</th>
                    <th className="py-3 px-4">Email & Kontak</th>
                    <th className="py-3 px-4">Peran (Role)</th>
                    <th className="py-3 px-4">Status Akun</th>
                    <th className="py-3 px-4 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers
                    .filter(u => {
                      if (userFilter === 'NEW_TEST') return u.isDemoData === false;
                      if (userFilter === 'DEMO') return u.isDemoData !== false;
                      if (userFilter === 'PENDING') return u.status === 'PENDING_VERIFICATION';
                      return true;
                    })
                    .map(u => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{u.fullName}</span>
                          {u.facilityName && (
                            <span className="text-[11px] text-slate-500 font-medium">Institusi: {u.facilityName}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {u.isDemoData === false ? (
                            <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              UJI COBA BARU
                            </span>
                          ) : (
                            <span className="font-medium text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              DEMO SIMULASI
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="text-slate-800">{u.email}</div>
                          <div className="font-mono text-[11px] text-slate-500">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.status === 'ACTIVE' && (
                            <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                              Aktif
                            </span>
                          )}
                          {u.status === 'PENDING_VERIFICATION' && (
                            <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                              Menunggu Verifikasi
                            </span>
                          )}
                          {u.status === 'SUSPENDED' && (
                            <span className="text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                              Ditangguhkan
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.status === 'PENDING_VERIFICATION' && u.facilityId && (
                            <button
                              onClick={() => verifyFacility(u.facilityId!)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] cursor-pointer shadow-xs transition-colors"
                            >
                              Verifikasi
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Administrative Report PDF Modal */}
      <AdministrativeReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="ADMIN"
      />
    </div>
  );
};
