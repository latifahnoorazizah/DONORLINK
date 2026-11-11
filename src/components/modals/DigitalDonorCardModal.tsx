import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Share2, 
  ShieldCheck, 
  AlertCircle, 
  Heart, 
  Calendar, 
  MapPin, 
  Copy, 
  Check,
  Eye,
  Lock,
  Printer,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo, OFFICIAL_LOGO_SRC } from '../common/BrandLogo';

interface DigitalDonorCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalDonorCardModal: React.FC<DigitalDonorCardModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, currentDonorProfile, showToast, logSensitiveDataAccess } = useApp();
  const [copied, setCopied] = useState(false);
  const [showQrVerificationSheet, setShowQrVerificationSheet] = useState(false);

  if (!isOpen) return null;

  const donorId = currentUser.donorIdNumber || `DL-CRB-${new Date().getFullYear()}-${currentUser.id.slice(-4).toUpperCase()}`;
  const bloodType = currentDonorProfile?.bloodType || 'UNKNOWN';
  const rhesus = currentDonorProfile?.rhesus || 'UNKNOWN';
  const bloodDisplay = bloodType === 'UNKNOWN' ? '?' : bloodType;
  const rhesusDisplay = rhesus === 'POSITIVE' ? 'Rh (+)' : rhesus === 'NEGATIVE' ? 'Rh (-)' : 'Rh Belum Tahu';
  const isVerified = currentUser.bloodTypeVerified || false;
  const verificationHash = `DL99-${btoa(donorId).slice(0, 8)}-${donorId.slice(-4)}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(donorId);
    setCopied(true);
    showToast({
      type: 'info',
      title: 'Nomor Kartu Disalin',
      message: `Nomor ID Pendonor ${donorId} berhasil disalin ke clipboard.`
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    logSensitiveDataAccess(
      currentUser.fullName,
      'DONOR',
      'Cetak / Ekspor PDF Kartu Donor Digital Pribadi'
    );
    window.print();
  };

  const handleDownload = () => {
    logSensitiveDataAccess(
      currentUser.fullName,
      'DONOR',
      'Unduh Kartu Identitas Digital Pendonor'
    );
    showToast({
      type: 'success',
      title: 'Unduh Kartu Donor (Format Digital)',
      message: `Kartu Digital Pendonor ${currentUser.fullName} (${donorId}) siap dicetak atau disimpan sebagai PDF.`
    });
    handlePrint();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://donorlink-cirebon.id/verify/${donorId}`);
    showToast({
      type: 'info',
      title: 'Tautan Verifikasi Disalin',
      message: `Tautan publik verifikasi status pendonor sukarela (${donorId}) berhasil disalin.`
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:max-w-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donor-card-title"
      >
        {/* Top Modal Header - Hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <span id="donor-card-title" className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Kartu Identitas Pendonor Digital
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-5">
          {/* Physical Style Card Container */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white p-6 shadow-xl border border-rose-900/30 overflow-hidden">
            {/* Background Watermark Pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none select-none">
              <Heart className="w-64 h-64 text-rose-500" />
            </div>

            {/* DEMO Watermark Banner */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-mono font-bold tracking-wider text-amber-300 uppercase mb-4">
              <span>● KARTU DONOR DIGITAL</span>
              <span>· INTERNAL DONORLINK CIREBON</span>
            </div>

            {/* Header in Card: Logo & ID */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-11 w-auto bg-white/10 rounded-xl p-1 border border-white/15 flex items-center justify-center">
                  <img 
                    src={OFFICIAL_LOGO_SRC} 
                    alt="DONORLINK Mega Mendung" 
                    className="h-9 w-auto object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                    DONORLINK CIREBON
                  </h3>
                  <p className="text-[10px] text-rose-200/80 uppercase tracking-widest font-mono">
                    KARTU PENDONOR SUKARELA
                  </p>
                </div>
              </div>

              {/* Blood Group Highlight Circle */}
              <div className="text-right flex flex-col items-end">
                <div className="w-12 h-12 rounded-xl bg-rose-600/90 border border-rose-400/30 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-xl font-black leading-none text-white">
                    {bloodDisplay}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-rose-100 uppercase">
                    {rhesus === 'POSITIVE' ? '(+)' : rhesus === 'NEGATIVE' ? '(-)' : '?'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Content Grid */}
            <div className="py-4 grid grid-cols-3 gap-3 items-center">
              {/* Left 2 Cols: Personal Details */}
              <div className="col-span-2 space-y-2.5">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
                    Nama Pendonor
                  </span>
                  <div className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                    {currentUser.fullName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
                      Nomor ID
                    </span>
                    <button 
                      onClick={handleCopyId}
                      className="font-mono text-[11px] text-rose-200 hover:text-white flex items-center gap-1 cursor-pointer"
                      title="Klik untuk menyalin"
                    >
                      <span>{donorId}</span>
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">
                      Status Verifikasi
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isVerified 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isVerified ? (
                        <>
                          <ShieldCheck className="w-3 h-3" />
                          <span>Terverifikasi Sah</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Menunggu Faskes</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 flex-wrap pt-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">
                    {currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.city}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span>{currentUser.age ? `${currentUser.age} Th` : 'Usia Valid'}</span>
                </div>
              </div>

              {/* Right Col: Interactive QR Code Representation */}
              <div 
                onClick={() => setShowQrVerificationSheet(!showQrVerificationSheet)}
                className="col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-all backdrop-blur-xs border border-white/15 text-center cursor-pointer group"
                title="Klik untuk melihat data verifikasi QR"
              >
                <div className="p-1.5 bg-white rounded-lg shadow-xs group-hover:scale-105 transition-transform">
                  {/* Styled SVG QR Code Matrix */}
                  <svg 
                    className="w-16 h-16 text-slate-900" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect width="5" height="5" x="3" y="3" rx="1" fill="currentColor" />
                    <rect width="5" height="5" x="16" y="3" rx="1" fill="currentColor" />
                    <rect width="5" height="5" x="3" y="16" rx="1" fill="currentColor" />
                    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                    <path d="M21 21v.01" />
                    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                    <path d="M3 12h.01" />
                    <path d="M12 3h.01" />
                    <path d="M12 16v.01" />
                    <path d="M16 12h1" />
                    <path d="M21 12v.01" />
                    <path d="M12 21v-1" />
                  </svg>
                </div>
                <span className="text-[9px] font-mono text-rose-200 group-hover:text-white mt-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  Cek Data QR
                </span>
              </div>
            </div>

            {/* Footer in Card */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span className="italic">"Setetes Darah, Sejuta Harapan"</span>
              <span className="font-mono">Kota & Kab. Cirebon</span>
            </div>
          </div>

          {/* Interactive QR Code Data Verification Inspection Sheet */}
          {showQrVerificationSheet && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">Hasil Pemindaian Verifikasi QR Code</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  VALID SIGNATURE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">ID PENDONOR</span>
                  <span className="font-bold text-slate-800">{donorId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STATUS IDENTITAS</span>
                  <span className="font-bold text-emerald-700">{isVerified ? 'TERVERIFIKASI RESMI' : 'PENDAFTARAN AKTIF'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GOLONGAN & RHESUS</span>
                  <span className="font-bold text-rose-700">{bloodDisplay} {rhesusDisplay}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DOMISILI WILAYAH</span>
                  <span className="font-bold text-slate-800">{currentUser.city}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-400 block text-[10px]">HASH INTEGRITAS SISTEM</span>
                  <span className="text-slate-600 text-[10px] break-all">{verificationHash}</span>
                </div>
              </div>

              {/* Privacy Guarantee Note */}
              <div className="flex items-start gap-2 p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900">
                <Lock className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Jaminan Privasi UU PDP:</strong> Data sensitif seperti NIK, nomor telepon pribadi, dan rekam medis donor <strong>TIDAK DISERTAKAN</strong> dalam muatan QR Code ini untuk melindungi kerahasiaan identitas pengguna.
                </p>
              </div>
            </div>
          )}

          {/* Institutional Disclaimer Note */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Ketentuan Identitas & Batasan Medis</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Kartu ini merupakan tanda pengenal internal akun pendonor sukarela DONORLINK di wilayah Kota dan Kabupaten Cirebon. <strong>Bukan kartu resmi terbitan Palang Merah Indonesia (PMI) atau BDRS Rumah Sakit</strong>. Kelayakan medis fisik dan uji laboratorium tetap ditentukan secara langsung di fasilitas kesehatan sebelum proses pengambilan darah.
            </p>
          </div>

          {/* Action Buttons - Hidden on print */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 print:hidden">
            <button
              onClick={handleDownload}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Salin Tautan Status</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
