import React from 'react';
import { BloodType, Rhesus } from '../../types';
import { Droplet } from 'lucide-react';

interface BloodGroupSelectorProps {
  selectedBloodType: BloodType;
  selectedRhesus: Rhesus;
  onChangeBloodType: (bloodType: BloodType) => void;
  onChangeRhesus: (rhesus: Rhesus) => void;
  allowUnknown?: boolean;
  label?: string;
}

export const BloodGroupSelector: React.FC<BloodGroupSelectorProps> = ({
  selectedBloodType,
  selectedRhesus,
  onChangeBloodType,
  onChangeRhesus,
  allowUnknown = true,
  label = 'Pilih Golongan Darah & Faktor Rhesus'
}) => {
  const bloodOptions: { type: BloodType; label: string; desc: string }[] = [
    { type: 'A', label: 'Golongan A', desc: 'Antigen A pada eritrosit' },
    { type: 'B', label: 'Golongan B', desc: 'Antigen B pada eritrosit' },
    { type: 'AB', label: 'Golongan AB', desc: 'Resipien universal PRC' },
    { type: 'O', label: 'Golongan O', desc: 'Donor universal eritrosit' }
  ];

  if (allowUnknown) {
    bloodOptions.push({
      type: 'UNKNOWN',
      label: 'Belum Tahu',
      desc: 'Diperiksa di faskes saat skrining'
    });
  }

  const rhesusOptions: { rhesus: Rhesus; symbol: string; label: string; desc: string }[] = [
    { rhesus: 'POSITIVE', symbol: '(+)', label: 'Rhesus Positif', desc: 'Umum pada populasi Indonesia (>99%)' },
    { rhesus: 'NEGATIVE', symbol: '(-)', label: 'Rhesus Negatif', desc: 'Golongan langka di Indonesia (<1%)' }
  ];

  if (allowUnknown) {
    rhesusOptions.push({
      rhesus: 'UNKNOWN',
      symbol: '(?)',
      label: 'Belum Tahu',
      desc: 'Uji serologi saat donor'
    });
  }

  return (
    <div className="space-y-3.5">
      {label && (
        <label className="block text-xs font-bold text-slate-800 tracking-tight">
          {label}
        </label>
      )}

      {/* ABO Group Cards */}
      <div>
        <span className="text-[11px] font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider font-mono">
          1. Sistem Golongan ABO
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {bloodOptions.map(option => {
            const isSelected = selectedBloodType === option.type;
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => onChangeBloodType(option.type)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-1 ring-rose-600' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-black tracking-tight leading-none ${isSelected ? 'text-rose-800' : 'text-slate-800'}`}>
                    {option.type === 'UNKNOWN' ? '?' : option.type}
                  </span>
                  <Droplet className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-600 fill-rose-600' : 'text-slate-300'}`} />
                </div>
                <div className="mt-2">
                  <span className={`text-xs font-bold block ${isSelected ? 'text-rose-950' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight block line-clamp-1 mt-0.5">
                    {option.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rhesus Cards */}
      <div>
        <span className="text-[11px] font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider font-mono">
          2. Faktor Rhesus (D Antigen)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {rhesusOptions.map(option => {
            const isSelected = selectedRhesus === option.rhesus;
            return (
              <button
                key={option.rhesus}
                type="button"
                onClick={() => onChangeRhesus(option.rhesus)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? 'border-rose-600 bg-rose-50/80 shadow-xs ring-1 ring-rose-600' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${isSelected ? 'text-rose-950' : 'text-slate-800'}`}>
                      {option.label}
                    </span>
                    <span className="font-mono text-xs font-bold text-rose-700">{option.symbol}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                    {option.desc}
                  </span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
