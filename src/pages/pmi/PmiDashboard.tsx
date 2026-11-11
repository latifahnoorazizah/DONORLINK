import React, { useState } from 'react';
import { 
  Syringe, 
  MapPin, 
  Building2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Users, 
  Search, 
  Plus, 
  Package, 
  Ticket, 
  Volume2, 
  FileText, 
  Download, 
  ArrowRight, 
  Check, 
  XCircle, 
  Filter, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest, BloodStockItem, BloodType, Rhesus, ComponentType, DonorBooking } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';
import { AdministrativeReportModal } from '../../components/modals/AdministrativeReportModal';

interface PmiDashboardProps {
  onViewDetail: (request: BloodRequest) => void;
}

export const PmiDashboard: React.FC<PmiDashboardProps> = ({ onViewDetail }) => {
  const { 
    currentUser, 
    requests, 
    facilities, 
    stockItems, 
    stockTransactions, 
    bloodBags,
    releaseBloodBag,
    discardBloodBag,
    addOrUpdateStock, 
    allocateStock, 
    handoverStock, 
    donorBookings, 
    currentCallingQueue, 
    callNextQueue, 
    checkInBooking, 
    updateBookingScreening, 
    completeDonorBooking, 
    cancelDonorBooking, 
    showToast 
  } = useApp();

  const myPmi = facilities.find(f => f.id === currentUser.facilityId) || facilities.find(f => f.type === 'UTD_PMI') || facilities[0];

  const [activeTab, setActiveTab] = useState<'stock' | 'queue' | 'demand' | 'reports' | 'mobileDrive'>('stock');
  const [stockSubTab, setStockSubTab] = useState<'components' | 'bags'>('components');
  const [selectedCity, setSelectedCity] = useState(myPmi.city);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Stock Modals State
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [newStockBloodType, setNewStockBloodType] = useState<BloodType>('O');
  const [newStockRhesus, setNewStockRhesus] = useState<Rhesus>('POSITIVE');
  const [newStockComponent, setNewStockComponent] = useState<ComponentType>('PRC');
  const [newStockUnits, setNewStockUnits] = useState(5);
  const [newStockNotes, setNewStockNotes] = useState('');

  // Allocate / Handover modal state
  const [selectedStockItem, setSelectedStockItem] = useState<BloodStockItem | null>(null);
  const [actionType, setActionType] = useState<'ALLOCATE' | 'HANDOVER'>('ALLOCATE');
  const [actionUnits, setActionUnits] = useState(1);
  const [actionRecipient, setActionRecipient] = useState('RSUD Gunung Jati Kota Cirebon');
  const [actionNotes, setActionNotes] = useState('');

  // Queue Screening Modal State
  const [screeningBooking, setScreeningBooking] = useState<DonorBooking | null>(null);
  const [hbLevel, setHbLevel] = useState(13.5);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [weightKg, setWeightKg] = useState(62);
  const [screeningPassed, setScreeningPassed] = useState(true);
  const [screeningNotes, setScreeningNotes] = useState('');

  // Mobile Drive Form State
  const [mobileDriveTitle, setMobileDriveTitle] = useState('Mobil Unit Donor Keliling — Alun-Alun Kejaksan Kota Cirebon');
  const [mobileDriveDate, setMobileDriveDate] = useState('Besok, 09.00 - 14.00 WIB');

  // Audio queue chime synthesizer
  const playQueueChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.3); // A5
      gain2.gain.setValueAtTime(0.25, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 1.0);
    } catch {
      // AudioContext fallback
    }
  };

  const handleCallQueue = () => {
    playQueueChime();
    callNextQueue();
  };

  // Filter requests by city
  const cityRequests = requests.filter(r => 
    r.city.toLowerCase().includes(selectedCity.toLowerCase()) || 
    selectedCity.toLowerCase().includes(r.city.toLowerCase())
  );

  // Filter stock items for this facility
  const myFacilityStock = stockItems.filter(s => s.facilityId === myPmi.id);
  const myFacilityBags = bloodBags.filter(b => b.facilityId === myPmi.id);

  // Calculate total units
  const totalAvailableStock = myFacilityStock.reduce((acc, s) => acc + s.unitsAvailable, 0);
  const totalReservedStock = myFacilityStock.reduce((acc, s) => acc + s.unitsReserved, 0);
  const totalQuarantineBags = myFacilityBags.filter(b => b.status === 'QUARANTINE_TESTING').length;

  // Today's bookings for this facility
  const myFacilityBookings = donorBookings.filter(b => b.facilityId === myPmi.id);

  // Handle Add Stock Submit
  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrUpdateStock({
      facilityId: myPmi.id,
      bloodType: newStockBloodType,
      rhesus: newStockRhesus,
      componentType: newStockComponent,
      unitsChange: Number(newStockUnits),
      type: 'ADD_STOCK',
      notes: newStockNotes || 'Penambahan stok resmi UTD'
    });
    setIsAddStockModalOpen(false);
    setNewStockNotes('');
  };

  // Handle Allocate or Handover Submit
  const handleStockActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockItem) return;

    if (actionType === 'ALLOCATE') {
      allocateStock({
        stockId: selectedStockItem.id,
        units: Number(actionUnits),
        hospitalName: actionRecipient,
        notes: actionNotes
      });
    } else {
      handoverStock({
        stockId: selectedStockItem.id,
        units: Number(actionUnits),
        recipientName: actionRecipient,
        notes: actionNotes
      });
    }
    setSelectedStockItem(null);
    setActionNotes('');
  };

  // Handle Screening Submit
  const handleScreeningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screeningBooking) return;

    updateBookingScreening(screeningBooking.id, {
      hbLevel: Number(hbLevel),
      bloodPressure,
      weightKg: Number(weightKg),
      passed: screeningPassed,
      notes: screeningNotes
    });
    setScreeningBooking(null);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const csvRows = [
      ['ID Transaksi / Booking', 'Tanggal', 'Tipe Aktivitas', 'Golongan Darah', 'Rhesus', 'Komponen', 'Jumlah (Kantong)', 'Status / Keterangan', 'Petugas'],
      ...stockTransactions.map(tx => [
        tx.id,
        new Date(tx.timestamp).toLocaleDateString('id-ID'),
        tx.type,
        tx.bloodType,
        tx.rhesus === 'POSITIVE' ? 'Positif' : 'Negatif',
        tx.componentType,
        tx.units,
        tx.notes || tx.recipientHospitalOrPatient || '-',
        tx.staffName
      ]),
      ...donorBookings.map(b => [
        b.id,
        b.bookingDate,
        'DONOR_SUKARELA',
        b.donorBloodType,
        b.donorRhesus === 'POSITIVE' ? 'Positif' : 'Negatif',
        'WHOLE_BLOOD',
        1,
        `Status: ${b.status} (Antrean ${b.queueNumber || '-'})`,
        b.donorName
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Operasional_UTD_PMI_${selectedCity.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Laporan CSV Diunduh',
      message: 'File laporan operasional dan log mutasi stok telah berhasil diunduh.'
    });
  };

  const handlePublishMobileDrive = (e: React.FormEvent) => {
    e.preventDefault();
    showToast({
      type: 'success',
      title: 'Jadwal Mobil Unit Dipublikasikan',
      message: `${mobileDriveTitle} (${mobileDriveDate}) telah diperbarui untuk wilayah ${selectedCity}.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <BrandLogo variant="badge" className="w-14 h-14" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {myPmi.name}
              </h2>
              <span className="text-[11px] font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                Unit Transfusi Darah (UTD)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Koordinator: <strong className="text-slate-800">{currentUser.fullName}</strong> · Wilayah Operasional: {myPmi.city}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Unduh Laporan Pelayanan (PDF)</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
            <span className="text-slate-500 font-medium text-[11px]">Pantauan:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="py-1 bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="Kota Cirebon">Kota Cirebon</option>
              <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-medium block">Total Stok Siap</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{totalAvailableStock}</span>
            <span className="text-slate-400">kantong</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-2xs">
          <span className="text-rose-800 font-medium block">Karantina Uji IMLTD</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-700">{totalQuarantineBags}</span>
            <span className="text-rose-500 text-[11px]">uji lab</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-medium block">Direservasi (RS)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-700">{totalReservedStock}</span>
            <span className="text-slate-400">kantong</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-medium block">Antrean Hari Ini</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-red-700">{myFacilityBookings.length}</span>
            <span className="text-slate-400">pendonor</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-slate-500 font-medium block">Panggilan Aktif</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-700">{currentCallingQueue}</span>
            <span className="text-slate-400">loket</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stock' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Manajemen Stok Darah UTD</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">
            {myFacilityStock.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'queue' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Antrean & Booking Donor Sukarela</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-red-600 text-white">
            {myFacilityBookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'demand' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Permintaan Pasien di Rumah Sakit ({cityRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reports' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laporan Operasional & Ekspor</span>
        </button>

        <button
          onClick={() => setActiveTab('mobileDrive')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'mobileDrive' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Mobil Unit Keliling</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STOCK INVENTORY MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'stock' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Inventaris Darah UTD PMI ({myPmi.name})
              </h3>
              <p className="text-slate-500 text-[11px]">
                Data stok tersinkronisasi secara real-time untuk pemantauan rumah sakit jejaring Cirebon.
              </p>
            </div>

            <button
              onClick={() => setIsAddStockModalOpen(true)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Stok Kantong Darah</span>
            </button>
          </div>

          {/* Sub-tab switcher: Aggregate Components vs Detailed Physical Blood Bags */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
            <button
              onClick={() => setStockSubTab('components')}
              className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                stockSubTab === 'components'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ringkasan Komponen Darah (PRC/WB/TC/FFP)
            </button>
            <button
              onClick={() => setStockSubTab('bags')}
              className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                stockSubTab === 'bags'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Inventaris Kantong Darah Fisik & Uji Saring IMLTD</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-mono">
                {myFacilityBags.length}
              </span>
            </button>
          </div>

          {/* Sub-tab 1: Aggregate Stock Table */}
          {stockSubTab === 'components' && (
            <>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-4">Golongan & Rhesus</th>
                        <th className="py-3 px-4">Komponen</th>
                        <th className="py-3 px-4 text-center">Tersedia</th>
                        <th className="py-3 px-4 text-center">Direservasi</th>
                        <th className="py-3 px-4">Status Stok</th>
                        <th className="py-3 px-4 text-right">Tindakan Alokasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myFacilityStock.map(stock => {
                        const isLow = stock.unitsAvailable <= stock.minThreshold;
                        return (
                          <tr key={stock.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 text-red-900 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                                  <span>{stock.bloodType}</span>
                                  <span className="text-[8px] font-mono leading-none">
                                    {stock.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    Golongan {stock.bloodType} {stock.rhesus === 'POSITIVE' ? 'Positif' : 'Negatif'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Diperbarui: {new Date(stock.lastUpdated).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono font-medium text-slate-700">
                              {stock.componentType}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <span className="font-bold font-mono text-base tabular-nums text-slate-900">
                                {stock.unitsAvailable}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <span className="font-bold font-mono text-base tabular-nums text-amber-700">
                                {stock.unitsReserved}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isLow 
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}>
                                {isLow ? <AlertTriangle className="w-3 h-3 text-amber-700" /> : <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                                {isLow ? 'Stok Menipis' : 'Stok Aman'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedStockItem(stock);
                                    setActionType('ALLOCATE');
                                    setActionUnits(1);
                                  }}
                                  disabled={stock.unitsAvailable === 0}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                                >
                                  Alokasikan RS
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStockItem(stock);
                                    setActionType('HANDOVER');
                                    setActionUnits(Math.min(1, stock.unitsReserved || stock.unitsAvailable));
                                  }}
                                  disabled={stock.unitsAvailable === 0 && stock.unitsReserved === 0}
                                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-40"
                                >
                                  Serahkan
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Transactions Log */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Log Riwayat Mutasi Stok Darah Terakhir
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {stockTransactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          tx.type === 'ADD_STOCK' ? 'bg-emerald-100 text-emerald-800' :
                          tx.type === 'ALLOCATE' ? 'bg-amber-100 text-amber-800' :
                          tx.type === 'RELEASE_FROM_QUARANTINE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.type}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900">
                            {tx.units} Kantong {tx.componentType} ({tx.bloodType}{tx.rhesus === 'POSITIVE' ? '+' : '-'})
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {tx.notes} {tx.recipientHospitalOrPatient ? `· Tujuan: ${tx.recipientHospitalOrPatient}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-[10px] text-slate-400">
                        <span>{new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        <span className="block text-slate-500">{tx.staffName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sub-tab 2: Granular Physical Blood Bag Inventory & IMLTD Lab Screening */}
          {stockSubTab === 'bags' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Prosedur Keamanan Darah Transfusi:</strong> Seluruh kantong darah hasil donor sukarela wajib melalui uji saring laboratorium IMLTD (HIV, HBsAg, HCV, Sifilis). Kantong berstatus <strong className="text-rose-700">QUARANTINE_TESTING</strong> belum dapat disalurkan ke rumah sakit sebelum mendapat verifikasi kelulusan dan otorisasi rilis dari staf laboratorium.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-4">No. Seri Kantong</th>
                        <th className="py-3 px-4">Gol / Rhesus</th>
                        <th className="py-3 px-4">Komponen & Vol</th>
                        <th className="py-3 px-4">Tgl Ambil / Kedaluwarsa</th>
                        <th className="py-3 px-4">Uji Saring IMLTD</th>
                        <th className="py-3 px-4">Status Kantong</th>
                        <th className="py-3 px-4 text-right">Otorisasi Lab</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myFacilityBags.map(bag => {
                        const isQuarantined = bag.status === 'QUARANTINE_TESTING';
                        const isNonReactive = 
                          bag.imltdScreening.hiv === 'NON_REACTIVE' &&
                          bag.imltdScreening.hepatitisB === 'NON_REACTIVE' &&
                          bag.imltdScreening.hepatitisC === 'NON_REACTIVE' &&
                          bag.imltdScreening.syphilis === 'NON_REACTIVE';

                        return (
                          <tr key={bag.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              <span className="block text-slate-900">{bag.bagSerialNumber}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {bag.id}</span>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-rose-700 font-mono">
                                {bag.bloodType}{bag.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-700">
                              <span>{bag.componentType}</span>
                              <span className="block text-[10px] text-slate-400">{bag.volumeMl} ml</span>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                              <div>Ambil: {bag.donationDate}</div>
                              <div className="text-rose-600 font-semibold">Exp: {bag.expiryDate}</div>
                            </td>

                            <td className="py-3 px-4 text-[10px] font-mono">
                              <div className="grid grid-cols-2 gap-1 max-w-[170px]">
                                <span className={`px-1.5 py-0.5 rounded text-center ${
                                  bag.imltdScreening.hiv === 'NON_REACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  HIV: {bag.imltdScreening.hiv === 'NON_REACTIVE' ? 'NR' : 'PND'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-center ${
                                  bag.imltdScreening.hepatitisB === 'NON_REACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  HBsAg: {bag.imltdScreening.hepatitisB === 'NON_REACTIVE' ? 'NR' : 'PND'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-center ${
                                  bag.imltdScreening.hepatitisC === 'NON_REACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  HCV: {bag.imltdScreening.hepatitisC === 'NON_REACTIVE' ? 'NR' : 'PND'}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-center ${
                                  bag.imltdScreening.syphilis === 'NON_REACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  TPHA: {bag.imltdScreening.syphilis === 'NON_REACTIVE' ? 'NR' : 'PND'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                bag.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                                bag.status === 'QUARANTINE_TESTING' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                                bag.status === 'ALLOCATED' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                                bag.status === 'EXPIRED' || bag.status === 'DISCARDED_DEFECTIVE' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {bag.status === 'AVAILABLE' ? 'Siap Transfusi' :
                                 bag.status === 'QUARANTINE_TESTING' ? 'Karantina Lab' :
                                 bag.status === 'ALLOCATED' ? 'Direservasi' :
                                 bag.status === 'IN_TRANSIT' ? 'Dalam Distribusi' :
                                 bag.status === 'RECEIVED_BY_FACILITY' ? 'Diterima RS' :
                                 bag.status === 'EXPIRED' ? 'Kedaluwarsa' : 'Dimusnahkan'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isQuarantined && isNonReactive && (
                                  <button
                                    onClick={() => releaseBloodBag(bag.id, 'Otorisasi staf lab: hasil IMLTD 4 parameter Non-Reaktif')}
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer shadow-xs whitespace-nowrap"
                                  >
                                    Rilis ke Stok Siap
                                  </button>
                                )}

                                {bag.status === 'AVAILABLE' && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Afkir kantong ${bag.bagSerialNumber}? Kantong akan dikeluarkan dari stok.`)) {
                                        discardBloodBag(bag.id, 'Pemeriksaan integritas kemasan');
                                      }
                                    }}
                                    className="px-2 py-1 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[10px] font-semibold cursor-pointer"
                                  >
                                    Afkir
                                  </button>
                                )}

                                {bag.status === 'ALLOCATED' && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Dialokasikan ke RS
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: VOLUNTARY DONOR BOOKING & QUEUE SYSTEM */}
      {/* ======================================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Active Queue Display & Call Controls */}
          <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-red-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-red-300 block mb-1">
                Sistem Pemanggilan Antrean UTD PMI
              </span>
              <h3 className="text-xl font-bold tracking-tight">
                Loket Pendaftaran & Bilik Skrining Fisik
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Tekan tombol untuk memanggil nomor antrean berikutnya menuju ruang periksa hemoglobin & tekanan darah.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-slate-300 uppercase block font-mono">Nomor Dipanggil</span>
                <span className="text-3xl font-black font-mono text-white tracking-wider block mt-0.5">
                  {currentCallingQueue}
                </span>
              </div>

              <button
                onClick={handleCallQueue}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <Volume2 className="w-4 h-4" />
                <span>Panggil Antrean</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900">
                  Daftar Booking Donor Sukarela Hari Ini ({myFacilityBookings.length})
                </h4>
                <p className="text-slate-500 text-[11px]">
                  Terpisah dari donor untuk permohonan pasien darurat di rumah sakit.
                </p>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Pembaruan Real-Time</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="py-3 px-4">No. Antrean & ID</th>
                    <th className="py-3 px-4">Nama Pendonor</th>
                    <th className="py-3 px-4">Gol. Darah</th>
                    <th className="py-3 px-4">Slot Waktu</th>
                    <th className="py-3 px-4">Status Proses</th>
                    <th className="py-3 px-4 text-right">Aksi Operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myFacilityBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 mr-2">
                          {b.queueNumber || '-'}
                        </span>
                        <span className="text-slate-400 text-[10px]">#{b.id}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{b.donorName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{b.donorPhone}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-700">
                        {b.donorBloodType}{b.donorRhesus === 'POSITIVE' ? '(+)' : '(-)'}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {b.timeSlot}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          b.status === 'DONATION_COMPLETED' ? 'bg-emerald-100 text-emerald-900' :
                          b.status === 'SCREENING_PASSED' ? 'bg-blue-100 text-blue-900' :
                          b.status === 'SCREENING_FAILED' ? 'bg-rose-100 text-rose-900' :
                          b.status === 'CHECKED_IN' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status === 'DONATION_COMPLETED' ? 'Donor Berhasil Selesai' :
                           b.status === 'SCREENING_PASSED' ? 'Lolos Skrining (Bilik Aftap)' :
                           b.status === 'SCREENING_FAILED' ? 'Gagal Skrining Medis' :
                           b.status === 'CHECKED_IN' ? 'Hadir (Check-In)' : 'Terdaftar (Belum Hadir)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'BOOKED' && (
                            <button
                              onClick={() => checkInBooking(b.id)}
                              className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              Check-In Loket
                            </button>
                          )}

                          {b.status === 'CHECKED_IN' && (
                            <button
                              onClick={() => {
                                setScreeningBooking(b);
                                setHbLevel(13.5);
                                setBloodPressure('120/80');
                                setWeightKg(62);
                                setScreeningPassed(true);
                              }}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              Input Skrining
                            </button>
                          )}

                          {b.status === 'SCREENING_PASSED' && (
                            <button
                              onClick={() => completeDonorBooking(b.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold cursor-pointer"
                            >
                              Catat Donor Berhasil
                            </button>
                          )}

                          {b.status === 'DONATION_COMPLETED' && (
                            <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                              <Check className="w-3.5 h-3.5" /> Tercatat +1 Kantong
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REGIONAL HOSPITAL DEMAND MONITORING */}
      {/* ======================================================== */}
      {activeTab === 'demand' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <h4 className="font-bold text-sm text-slate-900">
              Daftar Permintaan Darurat di {selectedCity} ({cityRequests.length})
            </h4>
            <span>UTD PMI memantau koordinasi antar-faskes</span>
          </div>

          <div className="space-y-3">
            {cityRequests.map(req => (
              <div 
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-800 flex flex-col items-center justify-center font-bold text-base shrink-0">
                    <span>{req.bloodType}</span>
                    <span className="text-[9px] font-mono leading-none">
                      {req.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-slate-900">{req.patientIdentifier}</h5>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        #{req.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        req.source === 'HOSPITAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.source === 'HOSPITAL' ? 'Diajukan oleh RS' : 'Diajukan oleh Keluarga'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {req.hospitalName} ({req.city}) · {req.componentType}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                      Kebutuhan: {req.bagsFulfilled} / {req.bagsNeeded} Kantong · Urgensi: {req.urgency}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onViewDetail(req)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                >
                  Tinjau Koordinasi
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: OPERATIONAL REPORTS & CSV EXPORT */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Laporan & Rekapitulasi Operasional UTD PMI Cirebon
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statistik riil kegiatan donor darah sukarela, hasil skrining, mutasi kantong darah, dan alokasi faskes.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Laporan (CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Tingkat Keberhasilan Skrining</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-700">92%</span>
                <span className="text-slate-400">lolos Hb & tensi</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Penyaluran ke Rumah Sakit</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-blue-700">18</span>
                <span className="text-slate-400">kantong minggu ini</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 font-medium block">Gagal Skrining Terbanyak</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-bold text-rose-700">Hb Rendah (&lt;12.5)</span>
                <span className="text-slate-400">4 kasus</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: MOBILE DRIVE PUBLISHER */}
      {/* ======================================================== */}
      {activeTab === 'mobileDrive' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-red-700" />
            <h4 className="font-bold text-base text-slate-900">
              Publikasi Layanan & Mobil Unit Donor Keliling
            </h4>
          </div>

          <form onSubmit={handlePublishMobileDrive} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Lokasi Kegiatan Donor Darah Massal Cirebon:
              </label>
              <input
                type="text"
                required
                value={mobileDriveTitle}
                onChange={(e) => setMobileDriveTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Waktu Pelaksanaan:
              </label>
              <input
                type="text"
                required
                value={mobileDriveDate}
                onChange={(e) => setMobileDriveDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Jadwal mobil unit ini langsung tampil pada Beranda Publik untuk mengarahkan pendonor sukarela rutin di wilayah {selectedCity}.
            </p>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              Perbarui Informasi Resmi UTD
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD STOCK KANTONG DARAH */}
      {/* ======================================================== */}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Tambah Stok Kantong Darah UTD</h3>
              <button onClick={() => setIsAddStockModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStockSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Golongan ABO:</label>
                  <select
                    value={newStockBloodType}
                    onChange={(e) => setNewStockBloodType(e.target.value as BloodType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Faktor Rhesus:</label>
                  <select
                    value={newStockRhesus}
                    onChange={(e) => setNewStockRhesus(e.target.value as Rhesus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="POSITIVE">Positif (+)</option>
                    <option value="NEGATIVE">Negatif (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Komponen Darah:</label>
                <select
                  value={newStockComponent}
                  onChange={(e) => setNewStockComponent(e.target.value as ComponentType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="PRC">Packed Red Cells (PRC)</option>
                  <option value="WHOLE_BLOOD">Whole Blood (WB)</option>
                  <option value="THROMBOCYTE">Thrombocyte Concentrate (TC)</option>
                  <option value="FFP">Fresh Frozen Plasma (FFP)</option>
                  <option value="CRYOPRECIPITATE">Kriopresipitat</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jumlah Kantong Ditambahkan:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={newStockUnits}
                  onChange={(e) => setNewStockUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Asal Darah (Batch/Donor):</label>
                <input
                  type="text"
                  value={newStockNotes}
                  onChange={(e) => setNewStockNotes(e.target.value)}
                  placeholder="Contoh: Hasil donor sukarela mobil unit Kejaksan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStockModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold"
                >
                  Simpan Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ALLOCATE OR HANDOVER STOCK */}
      {/* ======================================================== */}
      {selectedStockItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {actionType === 'ALLOCATE' ? 'Alokasi Stok untuk Rumah Sakit' : 'Penyerahan Darah Resmi'}
              </h3>
              <button onClick={() => setSelectedStockItem(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockActionSubmit} className="space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">
                  Golongan {selectedStockItem.bloodType}{selectedStockItem.rhesus === 'POSITIVE' ? '+' : '-'} · {selectedStockItem.componentType}
                </span>
                <span className="text-[11px] text-slate-500">
                  Tersedia: {selectedStockItem.unitsAvailable} kantong · Direservasi: {selectedStockItem.unitsReserved} kantong
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jumlah Kantong:</label>
                <input
                  type="number"
                  min="1"
                  max={actionType === 'ALLOCATE' ? selectedStockItem.unitsAvailable : (selectedStockItem.unitsReserved + selectedStockItem.unitsAvailable)}
                  required
                  value={actionUnits}
                  onChange={(e) => setActionUnits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {actionType === 'ALLOCATE' ? 'Nama Rumah Sakit / BDRS Tujuan:' : 'Penerima / Kurir Faskes:'}
                </label>
                <input
                  type="text"
                  required
                  value={actionRecipient}
                  onChange={(e) => setActionRecipient(e.target.value)}
                  placeholder="Contoh: RSUD Gunung Jati / Petugas BDRS"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan:</label>
                <input
                  type="text"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Nomor permintaan / diagnosa / nama pasien..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStockItem(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                >
                  Konfirmasi {actionType === 'ALLOCATE' ? 'Alokasi' : 'Penyerahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INPUT SKRINING PHYSICAL EXAM */}
      {/* ======================================================== */}
      {screeningBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Pencatatan Hasil Skrining Fisik Pendonor
              </h3>
              <button onClick={() => setScreeningBooking(null)} className="text-slate-400 hover:text-slate-700">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScreeningSubmit} className="space-y-3.5">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="font-bold text-slate-900 block">
                  {screeningBooking.donorName} (Antrean: {screeningBooking.queueNumber})
                </span>
                <span className="text-[11px] text-slate-600">
                  Golongan: {screeningBooking.donorBloodType}{screeningBooking.donorRhesus === 'POSITIVE' ? '(+)' : '(-)'} · No. HP: {screeningBooking.donorPhone}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kadar Hemoglobin (Hb):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={hbLevel}
                    onChange={(e) => setHbLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400">Normal: 12.5 - 17.0 g/dL</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tekanan Darah:</label>
                  <input
                    type="text"
                    required
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="Contoh: 120/80"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400">Sistole: 100-150 / Diastole: 70-90</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Keputusan Kelayakan Donor:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScreeningPassed(true)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      screeningPassed ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-1 ring-emerald-500' : 'bg-white border-slate-200'
                    }`}
                  >
                    Lolos Skrining (Bilik Aftap)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreeningPassed(false)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      !screeningPassed ? 'bg-rose-100 text-rose-900 border-rose-400 ring-1 ring-rose-500' : 'bg-white border-slate-200'
                    }`}
                  >
                    Tidak Memenuhi Syarat
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Catatan Medis Petugas:</label>
                <input
                  type="text"
                  value={screeningNotes}
                  onChange={(e) => setScreeningNotes(e.target.value)}
                  placeholder="Contoh: Hb dan tensi normal, donor Whole Blood 350ml disetujui"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScreeningBooking(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
                >
                  Simpan Hasil Skrining
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administrative Report PDF Modal for PMI */}
      <AdministrativeReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType="UTD_PMI"
      />
    </div>
  );
};
