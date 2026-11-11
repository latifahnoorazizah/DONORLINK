import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Check, 
  AlertCircle, 
  Clock, 
  Building2, 
  ShieldAlert,
  X 
} from 'lucide-react';
import { BloodRequest } from '../../types';
import { useApp } from '../../context/AppContext';

interface DonorCommitmentModalProps {
  request: BloodRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DonorCommitmentModal: React.FC<DonorCommitmentModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { addDonorResponse, showToast } = useApp();

  const [etaTime, setEtaTime] = useState('Hari ini dalam 2-3 jam ke depan');
  const [notes, setNotes] = useState('');
  const [criteriaConfirmed, setCriteriaConfirmed] = useState({
    sleep: false,
    healthy: false,
    noMeds: false,
    idCard: false
  });

  if (!isOpen || !request) return null;

  const allConfirmed = criteriaConfirmed.sleep && criteriaConfirmed.healthy && criteriaConfirmed.noMeds && criteriaConfirmed.idCard;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allConfirmed) {
      showToast({
        type: 'warning',
        title: 'Verifikasi Kesiapan Fisik',
        message: 'Mohon centang seluruh kriteria kelayakan awal sebelum mengirim komitmen.'
      });
      return;
    }

    addDonorResponse(request.id, etaTime, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-6">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Kesediaan Donor</h3>
              <p className="text-xs text-slate-500">Bantu pasien {request.patientIdentifier}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target destination */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">{request.hospitalName}</span>
              <span className="block text-[11px] text-slate-500">{request.hospitalRoom} · {request.city}</span>
            </div>
          </div>

          {/* Self-Screening Checklist */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 block">
              1. Konfirmasi Kesiapan Fisik Awal (Wajib):
            </label>
            <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteriaConfirmed.sleep}
                  onChange={(e) => setCriteriaConfirmed(prev => ({ ...prev, sleep: e.target.checked }))}
                  className="mt-0.5 rounded text-rose-700 focus:ring-rose-600"
                />
                <span className="text-slate-700">Tidur cukup minimal 5-6 jam semalam & telah makan sebelum donor.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteriaConfirmed.healthy}
                  onChange={(e) => setCriteriaConfirmed(prev => ({ ...prev, healthy: e.target.checked }))}
                  className="mt-0.5 rounded text-rose-700 focus:ring-rose-600"
                />
                <span className="text-slate-700">Merasa sehat, tidak sedang demam, flu, batuk, atau pusing.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteriaConfirmed.noMeds}
                  onChange={(e) => setCriteriaConfirmed(prev => ({ ...prev, noMeds: e.target.checked }))}
                  className="mt-0.5 rounded text-rose-700 focus:ring-rose-600"
                />
                <span className="text-slate-700">Tidak mengonsumsi antibiotik atau obat keras dalam 3 hari terakhir.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteriaConfirmed.idCard}
                  onChange={(e) => setCriteriaConfirmed(prev => ({ ...prev, idCard: e.target.checked }))}
                  className="mt-0.5 rounded text-rose-700 focus:ring-rose-600"
                />
                <span className="text-slate-700">Bersedia membawa KTP/Identitas resmi asli ke Rumah Sakit.</span>
              </label>
            </div>
          </div>

          {/* Arrival ETA */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1">
              2. Estimasi Waktu Tiba di Rumah Sakit:
            </label>
            <input
              type="text"
              required
              value={etaTime}
              onChange={(e) => setEtaTime(e.target.value)}
              placeholder="Contoh: Hari ini pukul 14.30 WIB"
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-600 focus:border-rose-600"
            />
          </div>

          {/* Optional notes */}
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Catatan untuk Narahubung Faskes (Opsional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sedang dalam perjalanan dari Slipi menggunakan KRL..."
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-600 focus:border-rose-600 resize-none"
            />
          </div>

          {/* Medical disclaimer note */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
            <strong className="font-semibold block">Catatan Medis:</strong>
            Kehadiran Anda di rumah sakit tetap akan melalui uji saring hemoglobin (Hb) dan tensi oleh petugas BDRS. Keputusan kelayakan akhir ditentukan oleh dokter di lokasi.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!allConfirmed}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                allConfirmed
                  ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Kirim Komitmen Kesediaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
