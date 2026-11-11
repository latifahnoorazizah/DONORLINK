import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Syringe, 
  ShieldCheck, 
  Building2, 
  FlaskConical 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest, ComponentType } from '../../types';

interface BagReceiptModalProps {
  request: BloodRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BagReceiptModal: React.FC<BagReceiptModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { recordBagReceipt, currentUser } = useApp();

  const [bagSerialNumber, setBagSerialNumber] = useState(() => `BDRS-CRB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [componentType, setComponentType] = useState<ComponentType>(request?.componentType || 'PRC');
  const [donorNameOrLab, setDonorNameOrLab] = useState('');
  const [labNotes, setLabNotes] = useState('Lolos uji saring IMLTD (HBsAg, Anti-HCV, Anti-HIV, Sifilis) & crossmatch kompatibel.');

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordBagReceipt(request.id, {
      bagSerialNumber: bagSerialNumber.trim(),
      componentType,
      donorNameOrLab: donorNameOrLab.trim() || 'Relawan Sukarela Terdaftar',
      bloodType: request.bloodType,
      rhesus: request.rhesus,
      labNotes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pencatatan Penerimaan Kantong Darah
              </h3>
              <p className="text-[11px] text-slate-500">
                Verifikasi resmi oleh Bank Darah Rumah Sakit (BDRS)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-xs block">{request.patientIdentifier}</span>
              <span className="text-[11px] text-slate-600 block">{request.hospitalName} ({request.hospitalRoom})</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono text-rose-800">
                {request.bloodType}{request.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {request.bagsFulfilled} / {request.bagsNeeded} Kantong
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nomor Seri Kantong Darah (Barcode/Label BDRS):
            </label>
            <input
              type="text"
              required
              value={bagSerialNumber}
              onChange={(e) => setBagSerialNumber(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono text-xs bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Komponen Darah:
              </label>
              <select
                value={componentType}
                onChange={(e) => setComponentType(e.target.value as ComponentType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              >
                <option value="PRC">Packed Red Cells (PRC)</option>
                <option value="WHOLE_BLOOD">Whole Blood (WB)</option>
                <option value="THROMBOCYTE">Thrombocyte (TC)</option>
                <option value="FFP">Fresh Frozen Plasma</option>
                <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pendonor / Asal Lab:
              </label>
              <input
                type="text"
                required
                value={donorNameOrLab}
                onChange={(e) => setDonorNameOrLab(e.target.value)}
                placeholder="Contoh: Maya Indah / UTD PMI"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hasil Uji Skrining & Crossmatch Lab:
            </label>
            <textarea
              rows={2}
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white text-[11px]"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">Petugas Pemeriksa:</span>
            <span>{currentUser.fullName} ({currentUser.facilityName || 'BDRS Rumah Sakit'})</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Konfirmasi Kantong Diterima</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
