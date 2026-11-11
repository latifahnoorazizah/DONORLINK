import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />;
        let borderClass = 'border-slate-200';
        let bgClass = 'bg-white';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />;
          borderClass = 'border-emerald-100';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />;
          borderClass = 'border-rose-100';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />;
          borderClass = 'border-amber-100';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border ${borderClass} ${bgClass} flex items-start gap-3 transition-all duration-200 ease-out`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 tracking-tight leading-snug">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const SimulationBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/80 border-b border-amber-200/60 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <span className="font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded text-[11px] tracking-wide">
          SIMULASI LOKAL PROTOTYPE
        </span>
        <span className="text-amber-800/90 hidden sm:inline">
          Aplikasi berjalan dalam mode demonstrasi interaktif. Perubahan status disinkronkan secara reaktif pada penyimpanan lokal peramban Anda.
        </span>
      </div>
    </div>
  );
};

export const MedicalDisclaimerBanner: React.FC<{ onOpenDetail?: () => void }> = ({ onOpenDetail }) => {
  return (
    <div className="bg-slate-900 text-slate-200 px-4 py-2.5 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-slate-300 leading-normal">
            <strong className="text-white font-medium">Batas Peran Medis:</strong> DONORLINK adalah platform koordinasi pendonor sukarela. Bukan penyedia kantong darah dan tidak mengambil keputusan kelayakan medis atau kompatibilitas klinis.
          </p>
        </div>
        {onOpenDetail && (
          <button
            onClick={onOpenDetail}
            className="text-rose-300 hover:text-rose-200 underline underline-offset-2 whitespace-nowrap text-xs font-medium cursor-pointer"
          >
            Baca Batasan Lengkap
          </button>
        )}
      </div>
    </div>
  );
};

export const MedicalDisclaimerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Pernyataan Batasan Klinis & Hukum</h3>
              <p className="text-xs text-slate-500">Pedoman Operasional Platform DONORLINK</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="font-semibold text-slate-800 text-xs">1. Bukan Lembaga Fasilitas Transfusi</h4>
            <p>
              DONORLINK tidak mengelola darah secara fisik, tidak menyimpan stok plasma, dan tidak melakukan uji laboratorium skrining (seperti HIV, Hepatitis B/C, Sifilis, atau Malathion). Seluruh proses uji saring mutlak dilakukan oleh UTD PMI atau Bank Darah Rumah Sakit (BDRS).
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="font-semibold text-slate-800 text-xs">2. Komitmen Relawan Bukan Jaminan Darah</h4>
            <p>
              Pernyataan kesediaan seorang calon pendonor di aplikasi merupakan komitmen awal untuk hadir di faskes. Calon pendonor tetap dapat dinyatakan tidak memenuhi syarat (gagal skrining Hb, tekanan darah, atau riwayat obat) oleh tenaga medis di lokasi.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="font-semibold text-slate-800 text-xs">3. Prinsip Sukarela Tanpa Transaksi Komersial</h4>
            <p>
              Berdasarkan UU Kesehatan Republik Indonesia, donor darah adalah kegiatan kemanusiaan murni tanpa imbalan uang. Segala bentuk komersialisasi atau transaksi diperjualbelikan dilarang keras.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <h4 className="font-semibold text-slate-800 text-xs">4. Batasan Integrasi Platform Internal</h4>
            <p>
              DONORLINK beroperasi sebagai platform jejaring koordinasi internal antarakun resmi (BDRS Rumah Sakit, UTD PMI, relawan pendonor, dan pasien) di wilayah Kota Cirebon & Kabupaten Cirebon. DONORLINK tidak mengklaim integrasi API tertutup eksternal sepihak tanpa otorisasi formal institusi.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Saya Memahami Pedoman Ini
          </button>
        </div>
      </div>
    </div>
  );
};

export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className={`bg-white rounded-2xl w-full ${maxWidth} p-6 shadow-2xl border border-slate-200 my-8 transition-all`}>
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
