import React, { useState, useRef, useEffect } from 'react';
import { HealthcareFacility } from '../../types';
import { Building2, Search, MapPin, Check, ShieldCheck, X } from 'lucide-react';

interface HospitalSearchSelectProps {
  facilities: HealthcareFacility[];
  selectedHospitalId: string;
  onSelectHospital: (hospital: HealthcareFacility) => void;
  label?: string;
}

export const HospitalSearchSelect: React.FC<HospitalSearchSelectProps> = ({
  facilities,
  selectedHospitalId,
  onSelectHospital,
  label = 'Pilih Fasilitas Kesehatan (Rumah Sakit / BDRS)'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedHospital = facilities.find(f => f.id === selectedHospitalId);

  // Filter only hospitals (or clinics) in Kota Cirebon & Kabupaten Cirebon
  const filtered = facilities.filter(f => {
    const matchQuery = f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.city.toLowerCase().includes(query.toLowerCase()) ||
      f.address.toLowerCase().includes(query.toLowerCase());
    return matchQuery;
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-800 tracking-tight">
          {label} <span className="text-rose-600">*</span>
        </label>
      )}

      {/* Selected Box / Search Input */}
      <div className="relative">
        <div 
          onClick={() => setIsOpen(true)}
          className={`w-full px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
            isOpen 
              ? 'border-rose-600 ring-2 ring-rose-100 bg-white' 
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            {selectedHospital ? (
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate">
                  {selectedHospital.name}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {selectedHospital.city} · {selectedHospital.operationHours}
                </span>
              </div>
            ) : (
              <span className="text-slate-400">Cari rumah sakit di Cirebon...</span>
            )}
          </div>
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 max-h-72 flex flex-col">
            <div className="px-3 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ketik nama rumah sakit, kecamatan, atau kota..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-rose-600"
                />
                {query && (
                  <button 
                    type="button" 
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-center text-xs text-slate-500">
                  Tidak ditemukan fasilitas kesehatan dengan kata kunci "{query}" di Cirebon.
                </div>
              ) : (
                filtered.map(fac => {
                  const isSelected = fac.id === selectedHospitalId;
                  return (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => {
                        onSelectHospital(fac);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className={`w-full px-3.5 py-2.5 flex items-start justify-between text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-rose-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-bold ${isSelected ? 'text-rose-900' : 'text-slate-900'}`}>
                            {fac.name}
                          </span>
                          {fac.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Terverifikasi
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {fac.type === 'UTD_PMI' ? 'UTD' : 'RS'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {fac.address}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {fac.city} · Layanan: {fac.operationHours}
                        </p>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-rose-700 shrink-0 mt-1 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
