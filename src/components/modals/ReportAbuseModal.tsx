import React, { useState } from 'react';
import { Flag, AlertTriangle, X } from 'lucide-react';
import { BloodRequest, AbuseReport } from '../../types';
import { useApp } from '../../context/AppContext';

interface ReportAbuseModalProps {
  request: BloodRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { createAbuseReport, showToast } = useApp();
  const [reason, setReason] = useState<AbuseReport['reason']>('SUSPICIOUS_REQUEST');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = createAbuseReport({
      requestId: request?.id,
      targetTitle: request ? `Permintaan #${request.id} (${request.patientIdentifier})` : 'Laporan Kejanggalan Layanan',
      reason,
      description
    });
    setDescription('');
    showToast({
      type: 'success',
      title: 'Tiket Pengaduan Diterbitkan',
      message: `Laporan Anda telah tercatat dengan No. Tiket: ${newReport.ticketNumber}. Tim Admin akan melakukan moderasi.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-6">
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Laporkan Kejanggalan / Pengaduan</h3>
              <p className="text-xs text-slate-500">Pusat Layanan Moderasi & Pengaduan Wilayah Cirebon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Kategori Pengaduan / Pelanggaran:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as AbuseReport['reason'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-600"
            >
              <option value="SUSPICIOUS_REQUEST">1. Permintaan Palsu / Penipuan</option>
              <option value="FAKE_ACCOUNT">2. Akun Palsu / Tidak Valid</option>
              <option value="CONTACT_MISUSE">3. Penyalahgunaan Nomor Kontak / Spam</option>
              <option value="BLOOD_COMMERCIALIZATION">4. Jual Beli Darah / Calo (Komersialisasi)</option>
              <option value="SERVICE_ISSUE">5. Masalah Pelayanan di Faskes / UTD</option>
              <option value="SYSTEM_ISSUE">6. Gangguan Sistem / Bug Teknis</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Kronologi / Bukti Keterangan:
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail kejanggalan, nomor telepon oknum, atau isi pesan mencurigakan..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-600 resize-none"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            Laporan Anda akan ditinjau langsung oleh tim Administrator DONORLINK. Tindakan investigasi dan pembekuan akun dapat dilakukan jika terbukti melanggar hukum.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Kirim Laporan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
