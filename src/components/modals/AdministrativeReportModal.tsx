import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Calendar,
  Layers,
  Users,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_LOGO_SRC } from '../common/BrandLogo';

interface AdministrativeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'ADMIN' | 'UTD_PMI';
}

export const AdministrativeReportModal: React.FC<AdministrativeReportModalProps> = ({
  isOpen,
  onClose,
  reportType
}) => {
  const { 
    currentUser, 
    requests, 
    facilities, 
    allUsers, 
    donorProfiles,
    stockItems, 
    bloodBags, 
    donorBookings, 
    abuseReports,
    responses
  } = useApp();

  const [dateRange, setDateRange] = useState<'MONTH' | 'QUARTER' | 'ALL'>('MONTH');

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const docNumber = reportType === 'ADMIN'
    ? `DOC/DL-CRB/SUPER-ADM/2026/XI/${Math.floor(100 + Math.random() * 900)}`
    : `DOC/DL-CRB/UTD-PMI/2026/XI/${Math.floor(100 + Math.random() * 900)}`;

  // Aggregates for Admin
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter(r => r.status === 'CLOSED_FULFILLED').length;
  const activeRequests = requests.filter(r => r.status === 'OPEN' || r.status === 'PARTIALLY_FULFILLED').length;
  const verifiedFacilities = facilities.filter(f => f.isVerified).length;
  const donorCount = Object.keys(donorProfiles).length;
  const resolvedAbuseCount = abuseReports.filter(r => r.status === 'ACTION_TAKEN' || r.status === 'CLOSED').length;

  // Aggregates for PMI
  const totalBags = bloodBags.length;
  const availableBags = bloodBags.filter(b => b.status === 'AVAILABLE').length;
  const quarantineBags = bloodBags.filter(b => b.status === 'QUARANTINE_TESTING').length;
  const allocatedBags = bloodBags.filter(b => b.status === 'ALLOCATED' || b.status === 'IN_TRANSIT').length;
  const totalBookings = donorBookings.length;
  const completedBookings = donorBookings.filter(b => b.status === 'DONATION_COMPLETED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = reportType === 'ADMIN' ? {
      documentNumber: docNumber,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.fullName,
      role: currentUser.role,
      scope: 'Kota Cirebon & Kabupaten Cirebon',
      summary: {
        totalRequests,
        fulfilledRequests,
        activeRequests,
        verifiedFacilities,
        donorCount,
        resolvedAbuseCount
      },
      requests: requests.map(r => ({
        id: r.id,
        patient: r.patientIdentifier,
        bloodType: `${r.bloodType}(${r.rhesus === 'POSITIVE' ? '+' : '-'})`,
        component: r.componentType,
        hospital: r.hospitalName,
        status: r.status,
        bagsNeeded: r.bagsNeeded,
        bagsFulfilled: r.bagsFulfilled
      }))
    } : {
      documentNumber: docNumber,
      generatedAt: new Date().toISOString(),
      generatedBy: currentUser.fullName,
      role: currentUser.role,
      facility: currentUser.facilityName || 'PMI Kota/Kabupaten Cirebon',
      stockSummary: {
        totalBags,
        availableBags,
        quarantineBags,
        allocatedBags,
        totalBookings,
        completedBookings
      },
      bags: bloodBags.map(b => ({
        serial: b.bagSerialNumber,
        blood: `${b.bloodType}(${b.rhesus === 'POSITIVE' ? '+' : '-'})`,
        component: b.componentType,
        volumeMl: b.volumeMl,
        status: b.status,
        screening: b.imltdScreening
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType === 'ADMIN' ? 'Rekapitulasi_Sistem_Admin' : 'Rekapitulasi_Stok_PMI'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:rounded-none animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Top Controls (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-sm font-bold text-slate-900">
                {reportType === 'ADMIN' ? 'Laporan Rekapitulasi Eksekutif Admin' : 'Laporan Rekapitulasi Pelayanan Darah UTD PMI'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Format resmi ber-kop DONORLINK dengan ornamen Mega Mendung Cirebon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Data JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Ekspor PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer ml-1"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 text-slate-800 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8 font-sans">
          
          {/* Institutional Kop Surat Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src={OFFICIAL_LOGO_SRC} 
                  alt="DONORLINK Mega Mendung" 
                  className="h-16 sm:h-20 w-auto object-contain"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-rose-800 tracking-tight leading-none">
                    DONORLINK CIREBON
                  </h1>
                  <p className="text-xs font-bold text-slate-800 mt-1 uppercase tracking-wider">
                    Sistem Koordinasi & Pendataan Donor Darah Sukarela
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Wilayah Operasional: Kota Cirebon & Kabupaten Cirebon · Berbasis UU PDP No. 27/2022
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-600 hidden sm:block">
                <div className="font-bold text-slate-900">{docNumber}</div>
                <div>Tanggal: {todayStr}</div>
                <div>Status: Dokumen Resmi Terverifikasi</div>
              </div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wide">
              {reportType === 'ADMIN' 
                ? 'LAPORAN REKAPITULASI OPERASIONAL & PERMINTAAN DARAH' 
                : 'LAPORAN REKAPITULASI STOK, UJI SARING IMLTD & ANTREAN UTD PMI'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Periode: Berjalan ({todayStr}) · Dikeluarkan oleh: {currentUser.fullName} ({currentUser.role})
            </p>
          </div>

          {/* Executive Summary Cards */}
          {reportType === 'ADMIN' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Total Permohonan</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">{totalRequests} Kasus</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{fulfilledRequests} Terpenuhi</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Permintaan Aktif</span>
                <span className="text-xl font-bold font-mono text-rose-700 mt-0.5 block">{activeRequests} Pasien</span>
                <span className="text-[10px] text-slate-500">Mencari Relawan</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Pendonor Terdaftar</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">{donorCount} Orang</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Siap On-Call</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Faskes Terverifikasi</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">{verifiedFacilities} RS / UTD</span>
                <span className="text-[10px] text-slate-500">Kredensial Sah</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Kantong Tersedia</span>
                <span className="text-xl font-bold font-mono text-emerald-800 mt-0.5 block">{availableBags} Kantong</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Siap Transfusi</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Karantina Lab IMLTD</span>
                <span className="text-xl font-bold font-mono text-amber-700 mt-0.5 block">{quarantineBags} Kantong</span>
                <span className="text-[10px] text-amber-800 font-semibold">Pemeriksaan UTD</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Alokasi BDRS RS</span>
                <span className="text-xl font-bold font-mono text-blue-800 mt-0.5 block">{allocatedBags} Kantong</span>
                <span className="text-[10px] text-blue-700">Direservasi / Drop</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Booking Antrean Sukarela</span>
                <span className="text-xl font-bold font-mono text-slate-900 mt-0.5 block">{totalBookings} Pendonor</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{completedBookings} Selesai Aftap</span>
              </div>
            </div>
          )}

          {/* Section 1: Detailed Table */}
          {reportType === 'ADMIN' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  1. Rincian Permohonan Kebutuhan Darah Pasien Terakhir
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Total: {requests.length} data
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2 px-3">ID / Pasien</th>
                      <th className="py-2 px-3">Gol. Darah</th>
                      <th className="py-2 px-3">Komponen</th>
                      <th className="py-2 px-3">Rumah Sakit</th>
                      <th className="py-2 px-3">Kantong</th>
                      <th className="py-2 px-3">Urgensi</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {requests.slice(0, 10).map(req => (
                      <tr key={req.id}>
                        <td className="py-2 px-3 font-sans">
                          <span className="font-bold text-slate-900 block">{req.patientIdentifier}</span>
                          <span className="text-[10px] text-slate-400 font-mono">#{req.id}</span>
                        </td>
                        <td className="py-2 px-3 font-bold text-rose-700">
                          {req.bloodType}{req.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {req.componentType}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-800">
                          {req.hospitalName} ({req.hospitalRoom})
                        </td>
                        <td className="py-2 px-3">
                          {req.bagsFulfilled}/{req.bagsNeeded}
                        </td>
                        <td className="py-2 px-3 font-bold text-[10px]">
                          {req.urgency === 'CRITICAL_24H' ? 'KRITIS <24H' : req.urgency === 'URGENT_48H' ? 'URGENT 48H' : 'TERJADWAL'}
                        </td>
                        <td className="py-2 px-3 text-[10px] font-bold">
                          {req.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  1. Rincian Fisik Kantong Darah & Uji Saring IMLTD
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Total: {bloodBags.length} kantong
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] font-mono">
                    <tr>
                      <th className="py-2 px-3">No. Seri Kantong</th>
                      <th className="py-2 px-3">Golongan</th>
                      <th className="py-2 px-3">Komponen</th>
                      <th className="py-2 px-3">Volume</th>
                      <th className="py-2 px-3">Kadaluwarsa</th>
                      <th className="py-2 px-3">IMLTD (4 Parameter)</th>
                      <th className="py-2 px-3">Status Fisik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {bloodBags.slice(0, 10).map(bag => (
                      <tr key={bag.id}>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {bag.bagSerialNumber}
                        </td>
                        <td className="py-2 px-3 font-bold text-rose-700">
                          {bag.bloodType}{bag.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          {bag.componentType}
                        </td>
                        <td className="py-2 px-3">
                          {bag.volumeMl} ml
                        </td>
                        <td className="py-2 px-3 text-[10px]">
                          {bag.expiryDate}
                        </td>
                        <td className="py-2 px-3 text-[10px]">
                          HIV:{bag.imltdScreening.hiv === 'NON_REACTIVE' ? 'NR' : 'PND'} | 
                          HBsAg:{bag.imltdScreening.hepatitisB === 'NON_REACTIVE' ? 'NR' : 'PND'} | 
                          HCV:{bag.imltdScreening.hepatitisC === 'NON_REACTIVE' ? 'NR' : 'PND'} | 
                          TPHA:{bag.imltdScreening.syphilis === 'NON_REACTIVE' ? 'NR' : 'PND'}
                        </td>
                        <td className="py-2 px-3 font-bold text-[10px]">
                          {bag.status === 'AVAILABLE' ? 'SIAP TRANSFUSI' :
                           bag.status === 'QUARANTINE_TESTING' ? 'KARANTINA' :
                           bag.status === 'ALLOCATED' ? 'DIRESERVASI' : bag.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 2: Statement of Integrity & PDP Compliance */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Pernyataan Integritas Data & Kepatuhan Regulasi
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Laporan ini diterbitkan secara otomatis dari pangkalan data sistem DONORLINK Cirebon. Seluruh data identitas pasien dan pendonor sukarela dilindungi sesuai Undang-Undang Perlindungan Data Pribadi (UU No. 27 Tahun 2022) dan Permenkes RI tentang Pelayanan Darah. Informasi dalam dokumen ini bersifat rahasia medis institusi.
            </p>
          </div>

          {/* Digital Signature & Institutional Stamp Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[11px] text-slate-500 font-mono">Diverifikasi oleh Sistem DONORLINK:</p>
              <div className="mt-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[10px] text-slate-600 space-y-0.5">
                <div>HASH: SHA256-DL-{Date.now().toString(16).toUpperCase()}</div>
                <div>AUTORISASI: ROLE_{currentUser.role}</div>
                <div>STATUS KEASLIAN: TTE_TERVALIDASI_AKTIF</div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-600">
                Cirebon, {todayStr}
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {reportType === 'ADMIN' ? 'Super Administrator DONORLINK' : 'Penanggung Jawab Teknis UTD PMI'}
              </p>
              <div className="my-3 inline-block p-2 border border-rose-200 rounded-xl bg-rose-50/50">
                <span className="text-[9px] font-mono font-bold text-rose-800 uppercase block tracking-wider">
                  TERCATAT SECARA ELEKTRONIK
                </span>
                <span className="text-[8px] text-slate-500 font-mono">
                  KOTA & KABUPATEN CIREBON
                </span>
              </div>
              <p className="font-bold text-slate-900 underline text-xs">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                ID Petugas: {currentUser.donorIdNumber || currentUser.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
