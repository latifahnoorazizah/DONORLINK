import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Plus, 
  ArrowRight, 
  Filter, 
  Package, 
  FlaskConical, 
  Eye, 
  Check,
  Info,
  Printer,
  Download,
  BarChart3,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest, BloodStockItem, HospitalReportCategory, HospitalReportPeriod } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';
import { HospitalReportModal } from '../../components/modals/HospitalReportModal';

interface HospitalDashboardProps {
  onViewDetail: (request: BloodRequest) => void;
  onCreateRequest: () => void;
  onOpenBagReceipt?: (request: BloodRequest) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  onViewDetail,
  onCreateRequest,
  onOpenBagReceipt
}) => {
  const { 
    currentUser, 
    requests, 
    responses, 
    verifyRequestByHospital, 
    updateRequestStatus, 
    facilities, 
    stockItems 
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNVERIFIED' | 'OPEN' | 'CLOSED'>('ALL');
  const [activeTab, setActiveTab] = useState<'requests' | 'pmiStock' | 'reports'>('requests');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportCategory, setSelectedReportCategory] = useState<HospitalReportCategory>('BLOOD_REQUESTS');

  // Identify this user's facility
  const myFacility = facilities.find(f => f.id === currentUser.facilityId) || facilities[0];

  // Requests associated with this hospital
  const hospitalRequests = requests.filter(r => r.hospitalId === myFacility.id);

  const unverifiedCount = hospitalRequests.filter(r => r.verificationStatus === 'UNVERIFIED').length;
  const activeCount = hospitalRequests.filter(r => r.status === 'OPEN' || r.status === 'PARTIALLY_FULFILLED').length;
  const fulfilledCount = hospitalRequests.filter(r => r.status === 'CLOSED_FULFILLED').length;

  const filteredRequests = hospitalRequests.filter(req => {
    if (filterStatus === 'UNVERIFIED') return req.verificationStatus === 'UNVERIFIED';
    if (filterStatus === 'OPEN') return req.status === 'OPEN' || req.status === 'PARTIALLY_FULFILLED';
    if (filterStatus === 'CLOSED') return req.status === 'CLOSED_FULFILLED' || req.status === 'CLOSED_EXPIRED';
    return true;
  });

  // Filter public published PMI stock items
  const publishedPmiStock = stockItems.filter(s => s.isPublishedToPublic);

  const handleOpenReport = (cat: HospitalReportCategory = 'BLOOD_REQUESTS') => {
    setSelectedReportCategory(cat);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Facility Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <BrandLogo variant="badge" className="w-14 h-14" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {myFacility.name}
              </h2>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Faskes Resmi Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Petugas BDRS: <strong className="text-slate-800">{currentUser.fullName}</strong> · Bank Darah Rumah Sakit ({myFacility.city})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenReport('BLOOD_REQUESTS')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 border border-slate-200"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Unduh Laporan BDRS (PDF)</span>
          </button>

          <button
            onClick={onCreateRequest}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Permintaan Resmi BDRS</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Antrean Verifikasi Dokumen</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-800">
              {unverifiedCount}
            </span>
            <span className="text-xs text-slate-400">permohonan menunggu</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Kebutuhan Pasien Aktif</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-800">
              {activeCount}
            </span>
            <span className="text-xs text-slate-400">sedang dikoordinasikan</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">Permintaan Terpenuhi</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
              {fulfilledCount}
            </span>
            <span className="text-xs text-slate-400">kebutuhan selesai</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daftar Permintaan Pasien di BDRS ({hospitalRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pmiStock')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pmiStock' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Pantauan Stok UTD PMI Cirebon (Publikasi)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reports' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Laporan & Analisis Transfusi BDRS</span>
        </button>
      </div>

      {/* TAB 1: HOSPITAL REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'ALL' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Permintaan ({hospitalRequests.length})
              </button>
              <button
                onClick={() => setFilterStatus('UNVERIFIED')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'UNVERIFIED' ? 'bg-white font-bold text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggu Verifikasi ({unverifiedCount})
              </button>
              <button
                onClick={() => setFilterStatus('OPEN')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'OPEN' ? 'bg-white font-bold text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aktif ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('CLOSED')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterStatus === 'CLOSED' ? 'bg-white font-bold text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Selesai ({fulfilledCount})
              </button>
            </div>
          </div>

          {/* List of Requests */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Tidak ada data permohonan darah pada kategori ini.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => {
                const percent = Math.min(100, Math.round((req.bagsFulfilled / req.bagsNeeded) * 100));
                const matchedCount = responses.filter(r => r.requestId === req.id).length;

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex flex-col items-center justify-center font-bold text-base shrink-0">
                          <span>{req.bloodType}</span>
                          <span className="text-[9px] font-mono leading-none">
                            {req.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{req.patientIdentifier}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                              #{req.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                              req.source === 'HOSPITAL' 
                                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}>
                              {req.source === 'HOSPITAL' ? 'Diajukan oleh RS' : 'Diajukan oleh Keluarga'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Ruangan: <strong className="text-slate-700">{req.hospitalRoom}</strong> · Pemohon: {req.requesterName} ({req.requesterPhone})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {req.verificationStatus === 'UNVERIFIED' ? (
                          <button
                            onClick={() => verifyRequestByHospital(req.id)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Verifikasi Sekarang
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Terverifikasi BDRS
                          </span>
                        )}

                        {onOpenBagReceipt && req.status !== 'CLOSED_FULFILLED' && (
                          <button
                            onClick={() => onOpenBagReceipt(req)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                          >
                            <FlaskConical className="w-3.5 h-3.5" />
                            <span>+ Catat Kantong Diterima</span>
                          </button>
                        )}

                        <button
                          onClick={() => onViewDetail(req)}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Relawan Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="flex items-center justify-between text-slate-600 mb-1">
                          <span>Pemenuhan Kantong Darah:</span>
                          <span className="font-mono font-bold text-slate-900">
                            {req.bagsFulfilled} / {req.bagsNeeded} Kantong ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-slate-500">
                        <span>Relawan Berkomitmen: <strong className="text-slate-900 font-mono">{matchedCount} orang</strong></span>
                        <span>Urgensi: <strong className="text-rose-700">{req.urgency}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLISHED PMI BLOOD STOCK (VIEW-ONLY FOR HOSPITAL) */}
      {activeTab === 'pmiStock' && (
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Informasi Ketersediaan Stok UTD PMI Cirebon</h4>
              <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                Rumah sakit dapat melihat stok darah yang dipublikasikan oleh UTD PMI Kota Cirebon & UTD PMI Kabupaten Cirebon untuk koordinasi rujukan transfusi darurat (View-Only).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {publishedPmiStock.map(stock => (
              <div 
                key={stock.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-900 flex flex-col items-center justify-center font-bold text-sm shrink-0">
                    <span>{stock.bloodType}</span>
                    <span className="text-[8px] font-mono leading-none">
                      {stock.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {stock.componentType}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {stock.facilityName}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black font-mono text-slate-900 block">
                    {stock.unitsAvailable}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">Kantong Tersedia</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITAL REPORTS & ANALYTICS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-rose-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Pusat Laporan Transfusi & Analitik BDRS
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  DATA DEMO
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pilih kategori laporan untuk melihat data resmi, mengekspor JSON, atau mencetak dokumen bertanda tangan resmi BDRS.
              </p>
            </div>

            <button
              onClick={() => handleOpenReport('BLOOD_REQUESTS')}
              className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Buka Dokumen Resmi BDRS (PDF)</span>
            </button>
          </div>

          {/* 4 Report Categories Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Category A */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Kategori A
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{hospitalRequests.length} data</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  Laporan Permintaan Darah Masuk
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Rincian seluruh kebutuhan darah berdasarkan periode, golongan ABO & Rhesus, jenis komponen (WB, PRC, TC, FFP), dan ruangan rawat inap.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Format: <strong>Tabel Rekapitulasi + Kop RS</strong>
                </div>
                <button
                  onClick={() => handleOpenReport('BLOOD_REQUESTS')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen</span>
                </button>
              </div>
            </div>

            {/* Category B */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Kategori B
                  </span>
                  <span className="text-xs text-emerald-700 font-bold font-mono">
                    {Math.round((fulfilledCount / Math.max(1, hospitalRequests.length)) * 100)}% Terpenuhi
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  Laporan Kinerja Pemenuhan Darah
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Analisis pemenuhan kantong darah: status terpenuhi penuh, sebagian terpenuhi, belum terpenuhi, serta permohonan dibatalkan atau kadaluarsa.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Data: <strong>{fulfilledCount} Selesai • {activeCount} Berjalan</strong>
                </div>
                <button
                  onClick={() => handleOpenReport('FULFILLMENT')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen</span>
                </button>
              </div>
            </div>

            {/* Category C */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Kategori C
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                    Validasi Medis BDRS
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  Laporan Keterhubungan Pendonor & Donasi Berhasil
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pelacakan respon calon pendonor, komitmen kehadiran di faskes, konfirmasi kantong fisik yang lolos uji serologi BDRS, dan tingkat diskualifikasi skrining.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Aturan: <strong>Komitmen Hadir ≠ Donasi Berhasil</strong>
                </div>
                <button
                  onClick={() => handleOpenReport('CONNECTED_DONORS')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen</span>
                </button>
              </div>
            </div>

            {/* Category D */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Kategori D
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Log Audit Digital</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-2">
                  Laporan Rekapitulasi Aktivitas BDRS
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Riwayat peninjauan dokumen permohonan darah oleh staf rumah sakit, pencatatan penerimaan kantong darah, serta log pembaruan status sistem.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Integritas: <strong>Terekam Audit Log Aman</strong>
                </div>
                <button
                  onClick={() => handleOpenReport('HOSPITAL_ACTIVITY')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Dokumen</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick Tabular Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Ringkasan Transfusi Darah Terkini di {myFacility.name}
              </h4>
              <span className="text-[11px] text-slate-400">
                Menampilkan {hospitalRequests.length} permohonan
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Inisial Pasien</th>
                    <th className="p-2.5">Golongan</th>
                    <th className="p-2.5">Komponen</th>
                    <th className="p-2.5">Kebutuhan</th>
                    <th className="p-2.5">Status BDRS</th>
                    <th className="p-2.5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hospitalRequests.slice(0, 5).map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-mono font-semibold text-slate-700">#{req.id}</td>
                      <td className="p-2.5 font-bold text-slate-900">{req.patientIdentifier}</td>
                      <td className="p-2.5 font-extrabold text-rose-700">
                        {req.bloodType}{req.rhesus === 'POSITIVE' ? '+' : '-'}
                      </td>
                      <td className="p-2.5">{req.componentType}</td>
                      <td className="p-2.5 font-mono">{req.bagsFulfilled} / {req.bagsNeeded} ktg</td>
                      <td className="p-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'CLOSED_FULFILLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'PARTIALLY_FULFILLED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => onViewDetail(req)}
                          className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold cursor-pointer underline"
                        >
                          Rincian
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Hospital Report Modal */}
      <HospitalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        initialCategory={selectedReportCategory}
      />
    </div>
  );
};

