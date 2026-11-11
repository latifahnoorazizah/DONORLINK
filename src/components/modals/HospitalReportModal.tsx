import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  Calendar,
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  UserCheck, 
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_LOGO_SRC } from '../common/BrandLogo';
import { HospitalReportCategory, HospitalReportPeriod, BloodRequest } from '../../types';

interface HospitalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: HospitalReportCategory;
}

export const HospitalReportModal: React.FC<HospitalReportModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'BLOOD_REQUESTS'
}) => {
  const { currentUser, requests, responses, facilities } = useApp();

  const [category, setCategory] = useState<HospitalReportCategory>(initialCategory);
  const [period, setPeriod] = useState<HospitalReportPeriod>('MONTHLY');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  if (!isOpen) return null;

  const currentHospital = facilities.find(f => f.id === currentUser.facilityId) || facilities[0];
  const hospitalName = currentUser.facilityName || currentHospital?.name || 'RSUD Gunung Jati Kota Cirebon';
  const hospitalAddress = currentHospital?.address || 'Jl. Kesambi No.56, Drajat, Kec. Kesambi, Kota Cirebon';
  const hospitalPhone = currentHospital?.phone || '(0231) 206330 ext. BDRS';

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const docNumber = `LAP/BDRS-CRB/2026/XI/${Math.floor(1000 + Math.random() * 9000)}`;

  // Filter requests belonging to this hospital
  const hospitalRequests = useMemo(() => {
    return requests.filter(r => {
      if (currentUser.facilityId && r.hospitalId !== currentUser.facilityId) {
        return false;
      }

      // Period filter
      const reqDate = new Date(r.createdAt).getTime();
      const now = Date.now();

      if (period === 'DAILY') {
        return now - reqDate <= 24 * 3600 * 1000;
      }
      if (period === 'WEEKLY') {
        return now - reqDate <= 7 * 24 * 3600 * 1000;
      }
      if (period === 'MONTHLY') {
        return now - reqDate <= 30 * 24 * 3600 * 1000;
      }
      if (period === 'YEARLY') {
        return now - reqDate <= 365 * 24 * 3600 * 1000;
      }
      if (period === 'CUSTOM' && customStartDate && customEndDate) {
        const start = new Date(customStartDate).getTime();
        const end = new Date(customEndDate).getTime() + 24 * 3600 * 1000;
        return reqDate >= start && reqDate <= end;
      }
      return true;
    });
  }, [requests, currentUser.facilityId, period, customStartDate, customEndDate]);

  // Derived metrics
  const totalReq = hospitalRequests.length;
  const fulfilledReq = hospitalRequests.filter(r => r.status === 'CLOSED_FULFILLED').length;
  const partialReq = hospitalRequests.filter(r => r.status === 'PARTIALLY_FULFILLED').length;
  const openReq = hospitalRequests.filter(r => r.status === 'OPEN').length;
  const cancelledReq = hospitalRequests.filter(r => r.status === 'CLOSED_EXPIRED').length;

  const totalBagsNeeded = hospitalRequests.reduce((sum, r) => sum + r.bagsNeeded, 0);
  const totalBagsFulfilled = hospitalRequests.reduce((sum, r) => sum + r.bagsFulfilled, 0);
  const fulfillmentRate = totalBagsNeeded > 0 ? Math.round((totalBagsFulfilled / totalBagsNeeded) * 100) : 0;

  // Donor responses for these hospital requests
  const hospitalReqIds = new Set(hospitalRequests.map(r => r.id));
  const connectedResponses = responses.filter(resp => hospitalReqIds.has(resp.requestId));
  
  // Physical confirmed bags in BDRS
  const allReceivedBags = hospitalRequests.flatMap(r => (r.receivedBagsLog || []).map(b => ({
    ...b,
    requestId: r.id,
    patientIdentifier: r.patientIdentifier,
    bloodType: r.bloodType,
    rhesus: r.rhesus
  })));

  // Connected donor statistics (crucial rule: responded/committed != success!)
  const respondedDonorsCount = connectedResponses.length;
  const committedDonorsCount = connectedResponses.filter(resp => resp.responseStatus === 'COMMITTED').length;
  const confirmedDonationBagsCount = allReceivedBags.length; // strictly confirmed by BDRS receipt
  const failedOrCancelledCount = connectedResponses.filter(resp => resp.responseStatus === 'CANCELLED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      institution: hospitalName,
      unit: 'Bank Darah Rumah Sakit (BDRS) / Unit Transfusi Darah',
      documentNumber: docNumber,
      category,
      period,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.fullName,
      operatorRole: currentUser.role,
      summary: {
        totalRequests: totalReq,
        fulfilledRequests: fulfilledReq,
        partiallyFulfilledRequests: partialReq,
        openRequests: openReq,
        cancelledRequests: cancelledReq,
        totalBagsNeeded,
        totalBagsFulfilled,
        fulfillmentPercentage: `${fulfillmentRate}%`,
        connectedDonors: respondedDonorsCount,
        confirmedBDRSBags: confirmedDonationBagsCount
      },
      requests: hospitalRequests.map(r => ({
        id: r.id,
        patientMasked: r.patientIdentifier,
        bloodSpec: `${r.bloodType}${r.rhesus === 'POSITIVE' ? '+' : '-'}`,
        component: r.componentType,
        bagsNeeded: r.bagsNeeded,
        bagsFulfilled: r.bagsFulfilled,
        room: r.hospitalRoom,
        verificationStatus: r.verificationStatus,
        status: r.status,
        createdAt: r.createdAt
      })),
      receivedBagsLog: allReceivedBags
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_BDRS_${hospitalName.replace(/[^a-zA-Z0-9]/g, '_')}_${category}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pusat Pelaporan Resmi BDRS & Analisis
              </h3>
              <p className="text-[11px] text-slate-500">
                {hospitalName} • Wilayah Kota & Kabupaten Cirebon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar (Hidden when printing) */}
        <div className="p-3.5 sm:px-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setCategory('BLOOD_REQUESTS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                category === 'BLOOD_REQUESTS'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              A. Permintaan Darah
            </button>
            <button
              onClick={() => setCategory('FULFILLMENT')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                category === 'FULFILLMENT'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              B. Pemenuhan Darah
            </button>
            <button
              onClick={() => setCategory('CONNECTED_DONORS')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                category === 'CONNECTED_DONORS'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              C. Pendonor Terhubung
            </button>
            <button
              onClick={() => setCategory('HOSPITAL_ACTIVITY')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                category === 'HOSPITAL_ACTIVITY'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              D. Aktivitas Faskes
            </button>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Periode:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as HospitalReportPeriod)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden focus:border-rose-600"
            >
              <option value="DAILY">Harian (24 Jam)</option>
              <option value="WEEKLY">Mingguan (7 Hari)</option>
              <option value="MONTHLY">Bulanan (30 Hari)</option>
              <option value="YEARLY">Tahunan (2026)</option>
              <option value="CUSTOM">Rentang Kustom</option>
            </select>

            {period === 'CUSTOM' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-[11px]"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-md text-[11px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 bg-white print:p-8 print:text-black">
          
          {/* Official Kop Surat Faskes */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={OFFICIAL_LOGO_SRC} 
                  alt="DONORLINK Cirebon" 
                  className="h-14 w-auto object-contain"
                />
                <div className="h-10 w-px bg-slate-300 mx-1 hidden sm:block" />
                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                    {hospitalName}
                  </h1>
                  <h2 className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                    Bank Darah Rumah Sakit (BDRS) & Pelayanan Transfusi Darah
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {hospitalAddress} • Telp: {hospitalPhone}
                  </p>
                </div>
              </div>

              {/* Watermark badge */}
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[10px] tracking-wider uppercase">
                  DATA DEMO
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {docNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Document Title & Period Banner */}
          <div className="text-center space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 uppercase underline underline-offset-4">
              {category === 'BLOOD_REQUESTS' && 'Laporan Permintaan Darah Masuk'}
              {category === 'FULFILLMENT' && 'Laporan Kinerja Pemenuhan Kebutuhan Darah'}
              {category === 'CONNECTED_DONORS' && 'Laporan Keterhubungan Pendonor & Donasi BDRS'}
              {category === 'HOSPITAL_ACTIVITY' && 'Laporan Rekapitulasi Aktivitas & Log BDRS'}
            </h2>
            <p className="text-xs text-slate-600">
              Periode Penarikan: <strong className="text-slate-900">
                {period === 'DAILY' && 'Harian (24 Jam Terakhir)'}
                {period === 'WEEKLY' && 'Mingguan (7 Hari Terakhir)'}
                {period === 'MONTHLY' && 'Bulanan (30 Hari Terakhir)'}
                {period === 'YEARLY' && 'Tahunan Berjalan (Tahun 2026)'}
                {period === 'CUSTOM' && `${customStartDate || 'Awal'} s.d. ${customEndDate || 'Akhir'}`}
              </strong> • Tanggal Cetak: {todayStr}
            </p>
          </div>

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Total Permintaan</span>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalReq}</p>
              <span className="text-[10px] text-slate-400">Berkas masuk BDRS</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-800 font-medium">Tingkat Pemenuhan</span>
              <p className="text-xl font-extrabold text-emerald-900 mt-0.5">{fulfillmentRate}%</p>
              <span className="text-[10px] text-emerald-700">{totalBagsFulfilled} dari {totalBagsNeeded} kantong</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-800 font-medium">Kantong Dikonfirmasi BDRS</span>
              <p className="text-xl font-extrabold text-blue-900 mt-0.5">{confirmedDonationBagsCount}</p>
              <span className="text-[10px] text-blue-700">Lolos uji lab & serologi</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] text-amber-800 font-medium">Relawan Terhubung</span>
              <p className="text-xl font-extrabold text-amber-900 mt-0.5">{respondedDonorsCount}</p>
              <span className="text-[10px] text-amber-700">{committedDonorsCount} siap hadir</span>
            </div>
          </div>

          {/* Detailed Content According to Selected Category */}
          {category === 'BLOOD_REQUESTS' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>Rincian Permintaan Darah Masuk</span>
                <span className="text-[11px] font-normal text-slate-500">({hospitalRequests.length} data)</span>
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2.5">ID Permintaan</th>
                      <th className="p-2.5">Pasien (Tersensor)</th>
                      <th className="p-2.5">Gol. / Rhesus</th>
                      <th className="p-2.5">Komponen</th>
                      <th className="p-2.5 text-center">Kebutuhan</th>
                      <th className="p-2.5">Ruangan / Bangsal</th>
                      <th className="p-2.5">Status BDRS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {hospitalRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          Tidak ada data permintaan darah untuk periode ini.
                        </td>
                      </tr>
                    ) : (
                      hospitalRequests.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-semibold text-slate-800">#{r.id}</td>
                          <td className="p-2.5 font-semibold text-slate-900">{r.patientIdentifier}</td>
                          <td className="p-2.5 font-extrabold text-rose-700">
                            {r.bloodType}{r.rhesus === 'POSITIVE' ? '+' : '-'}
                          </td>
                          <td className="p-2.5 font-medium">{r.componentType}</td>
                          <td className="p-2.5 text-center">
                            <span className="font-bold text-slate-900">{r.bagsFulfilled}</span>
                            <span className="text-slate-400"> / {r.bagsNeeded} ktg</span>
                          </td>
                          <td className="p-2.5 text-slate-600">{r.hospitalRoom}</td>
                          <td className="p-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              r.verificationStatus === 'VERIFIED_BY_HOSPITAL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.verificationStatus === 'VERIFIED_BY_HOSPITAL' ? 'Terverifikasi' : 'Menunggu Berkas'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {category === 'FULFILLMENT' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Distribusi Status Pemenuhan Kantong Darah
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <div className="font-bold text-emerald-900">Terpenuhi Penuh (100%)</div>
                  <div className="text-lg font-black text-emerald-800 mt-1">{fulfilledReq} Permintaan</div>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Seluruh kantong darah telah diterima pasien.</p>
                </div>

                <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50">
                  <div className="font-bold text-blue-900">Sebagian Terpenuhi</div>
                  <div className="text-lg font-black text-blue-800 mt-1">{partialReq} Permintaan</div>
                  <p className="text-[10px] text-blue-700 mt-0.5">Sebagian kantong diterima, proses berlanjut.</p>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                  <div className="font-bold text-amber-900">Menunggu Relawan (Open)</div>
                  <div className="text-lg font-black text-amber-800 mt-1">{openReq} Permintaan</div>
                  <p className="text-[10px] text-amber-700 mt-0.5">Belum ada kantong darah yang masuk ke BDRS.</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="font-bold text-slate-700">Dibatalkan / Kadaluarsa</div>
                  <div className="text-lg font-black text-slate-800 mt-1">{cancelledReq} Permintaan</div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Batas waktu terlewati atau kondisi klinis membaik.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 mb-1">Catatan Kinerja Transfusi Rumah Sakit:</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Efektivitas pemenuhan kebutuhan transfusi darah di {hospitalName} saat ini mencapai <strong>{fulfillmentRate}%</strong>. Rata-rata waktu tanggap relawan donor sejak permohonan diverifikasi resmi oleh BDRS adalah <strong>42 menit</strong> di wilayah Cirebon.
                </p>
              </div>
            </div>
          )}

          {category === 'CONNECTED_DONORS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Analisis Keterhubungan Relawan & Validasi Donasi
                </h3>
                <span className="text-[10px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-semibold border border-rose-200">
                  Prinsip Medis: Komitmen Hadir ≠ Donasi Berhasil
                </span>
              </div>

              {/* Distinction info box */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Kaidah Penilaian Standar BDRS</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  Calon pendonor yang menyatakan bersedia atau telah tiba di lokasi belum tentu berhasil mendonorkan darahnya karena harus melewati skrining klinis (kadar Hb 12.5-17.0 g/dL, tekanan darah normal, dan uji crossmatch serologi). Hanya kantong yang tercatat di loket BDRS yang diakui sebagai <strong>Donasi Berhasil</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">1. Relawan Merespon</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{respondedDonorsCount} Orang</div>
                  <span className="text-[10px] text-slate-400">Menyatakan siap</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">2. Menuju Faskes</div>
                  <div className="text-lg font-black text-slate-900 mt-1">{committedDonorsCount} Orang</div>
                  <span className="text-[10px] text-slate-400">Estimasi waktu tiba</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div className="text-emerald-800 text-[11px] font-bold">3. Donasi Berhasil (BDRS)</div>
                  <div className="text-lg font-black text-emerald-900 mt-1">{confirmedDonationBagsCount} Kantong</div>
                  <span className="text-[10px] text-emerald-700">Tervalidasi BDRS</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">4. Gagal Skrining/Batal</div>
                  <div className="text-lg font-black text-slate-700 mt-1">{failedOrCancelledCount} Kejadian</div>
                  <span className="text-[10px] text-slate-400">Hb / riwayat medis</span>
                </div>
              </div>

              {/* Table of Confirmed Bags */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">
                  Daftar Kantong Fisik Terverifikasi Masuk ke Pasien:
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2.5">No. Seri Kantong</th>
                        <th className="p-2.5">Pasien Terkait</th>
                        <th className="p-2.5">Golongan & Rhesus</th>
                        <th className="p-2.5">Komponen</th>
                        <th className="p-2.5">Volume</th>
                        <th className="p-2.5">Nama Pendonor / Asal</th>
                        <th className="p-2.5">Waktu Penerimaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allReceivedBags.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-5 text-center text-slate-400">
                            Belum ada catatan fisik penerimaan kantong darah pada periode ini.
                          </td>
                        </tr>
                      ) : (
                        allReceivedBags.map((bag, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-rose-700">#{bag.bagSerialNumber}</td>
                            <td className="p-2.5 font-semibold text-slate-900">{bag.patientIdentifier}</td>
                            <td className="p-2.5 font-bold">{bag.bloodType}{bag.rhesus === 'POSITIVE' ? '+' : '-'}</td>
                            <td className="p-2.5">{bag.componentType}</td>
                            <td className="p-2.5">{bag.volumeMl ? `${bag.volumeMl} mL` : '350 mL'}</td>
                            <td className="p-2.5 font-medium text-slate-700">{bag.donorNameOrLab}</td>
                            <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                              {new Date(bag.receivedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {category === 'HOSPITAL_ACTIVITY' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Log Audit & Aktivitas Operasional BDRS
              </h3>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
                {hospitalRequests.flatMap(r => (r.timeline || []).map(t => ({ ...t, requestId: r.id }))).slice(0, 10).map((log, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        {log.description}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Petugas: <strong>{log.actorName}</strong></span>
                        <span>•</span>
                        <span>Peran: <strong className="uppercase">{log.actorRole}</strong></span>
                        <span>•</span>
                        <span>ID Permintaan: <strong>#{log.requestId}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Legal Masking Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Klausul Privasi Pasien (UU Pelindungan Data Pribadi):</strong> Seluruh data identitas pasien pada laporan ini disajikan dalam format inisial/masked identifier tanpa mencantumkan NIK, alamat lengkap, atau nomor rekam medis terbuka demi melindungi kerahasiaan medis pasien di wilayah Cirebon.
            </div>
          </div>

          {/* Official Signatures & BDRS Stamp */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center">
            <div>
              <p className="text-slate-500 text-[11px]">Mengetahui,</p>
              <p className="font-bold text-slate-800 mt-0.5">Kepala Bank Darah Rumah Sakit (BDRS)</p>
              <div className="h-16 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border border-rose-300 bg-rose-50/50 flex flex-col items-center justify-center text-rose-800 rotate-[-8deg] shadow-xs">
                  <span className="text-[8px] font-black tracking-widest uppercase">TERVERIFIKASI</span>
                  <span className="text-[10px] font-black uppercase">BDRS</span>
                  <span className="text-[7px] font-medium">CIREBON</span>
                </div>
              </div>
              <p className="font-bold text-slate-900 underline">{hospitalName}</p>
              <p className="text-[10px] text-slate-500">SIP: 503/440-DISKES/BDRS-2026</p>
            </div>

            <div>
              <p className="text-slate-500 text-[11px]">Kota Cirebon, {todayStr}</p>
              <p className="font-bold text-slate-800 mt-0.5">Petugas Operator Verifikasi Sistem</p>
              <div className="h-16 flex items-center justify-center">
                <span className="font-serif italic text-slate-400 text-sm">{currentUser.fullName}</span>
              </div>
              <p className="font-bold text-slate-900 underline">{currentUser.fullName}</p>
              <p className="text-[10px] text-slate-500">ID Operator: {currentUser.id}</p>
            </div>
          </div>

          {/* Footer Page Number & Hash */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>DONORLINK Platform • Wilayah Kota & Kabupaten Cirebon</span>
            <span>Halaman 1 dari 1 • Dokumen Resmi BDRS #{docNumber.split('/').pop()}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
