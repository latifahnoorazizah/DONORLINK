import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest, BloodType, Rhesus } from '../../types';
import { RequestCard } from '../../components/common/RequestCard';

interface MatchingBrowserProps {
  onViewDetail: (request: BloodRequest) => void;
  onCommit: (request: BloodRequest) => void;
  onCreateRequest: () => void;
}

export const MatchingBrowser: React.FC<MatchingBrowserProps> = ({
  onViewDetail,
  onCommit,
  onCreateRequest
}) => {
  const { requests, currentUser, responses } = useApp();

  const [selectedBlood, setSelectedBlood] = useState<string>('ALL');
  const [selectedRhesus, setSelectedRhesus] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const myCommittedIds = new Set(
    responses.filter(r => r.donorId === currentUser.id).map(r => r.requestId)
  );

  const filteredRequests = requests.filter(req => {
    if (req.status === 'CLOSED_FULFILLED' || req.status === 'CLOSED_EXPIRED' || req.status === 'CANCELLED') {
      return false;
    }

    if (selectedBlood !== 'ALL' && req.bloodType !== selectedBlood) return false;
    if (selectedRhesus !== 'ALL' && req.rhesus !== selectedRhesus) return false;
    if (selectedCity !== 'ALL' && !req.city.toLowerCase().includes(selectedCity.toLowerCase())) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.patientIdentifier.toLowerCase().includes(q);
      const matchHospital = req.hospitalName.toLowerCase().includes(q);
      const matchCity = req.city.toLowerCase().includes(q);
      if (!matchName && !matchHospital && !matchCity) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pusat Pencarian & Pencocokan Kebutuhan Darah
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data kebutuhan darah terverifikasi dari rumah sakit di Kota & Kabupaten Cirebon. Terbuka bagi calon pendonor sukarela.
          </p>
        </div>

        <button
          onClick={onCreateRequest}
          className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          + Ajukan Kebutuhan Darah Pasien
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari RS, kota, atau pasien..."
              className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 text-xs"
            />
          </div>

          {/* Blood Type Selector */}
          <div>
            <select
              value={selectedBlood}
              onChange={(e) => setSelectedBlood(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium"
            >
              <option value="ALL">Semua Golongan Darah</option>
              <option value="A">Golongan A</option>
              <option value="B">Golongan B</option>
              <option value="AB">Golongan AB</option>
              <option value="O">Golongan O</option>
            </select>
          </div>

          {/* Rhesus Selector */}
          <div>
            <select
              value={selectedRhesus}
              onChange={(e) => setSelectedRhesus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium"
            >
              <option value="ALL">Semua Faktor Rhesus (+ / -)</option>
              <option value="POSITIVE">Rhesus Positif (+)</option>
              <option value="NEGATIVE">Rhesus Negatif (-)</option>
            </select>
          </div>

          {/* City Selector */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium"
            >
              <option value="ALL">Semua Wilayah Cirebon</option>
              <option value="Kota Cirebon">Kota Cirebon</option>
              <option value="Kabupaten Cirebon">Kabupaten Cirebon</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>Menampilkan <strong className="text-slate-800">{filteredRequests.length}</strong> kebutuhan aktif</span>
          <button
            onClick={() => {
              setSelectedBlood('ALL');
              setSelectedRhesus('ALL');
              setSelectedCity('ALL');
              setSearchQuery('');
            }}
            className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Grid of Request Cards */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Tidak Ada Hasil yang Cocok</h3>
          <p className="text-xs text-slate-500 mt-1">
            Coba ubah filter golongan darah atau pilih kota yang lebih luas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              onViewDetail={onViewDetail}
              onCommit={onCommit}
              currentUserRole={currentUser.role}
              isCommittedByCurrentUser={myCommittedIds.has(req.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
