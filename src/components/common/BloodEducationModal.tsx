import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Heart,
  Droplet,
  Coffee,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { INITIAL_FAQS } from '../../data/initialData';
import { FaqItem } from '../../types';

interface BloodEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
}

export const BloodEducationModal: React.FC<BloodEducationModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking
}) => {
  const { facilities } = useApp();
  const [activeTab, setActiveTab] = useState<'criteria' | 'prep' | 'procedure' | 'locations' | 'faq'>('criteria');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const pmiFacilities = facilities.filter(f => f.type === 'UTD_PMI');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[88vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="education-modal-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-50 text-red-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 id="education-modal-title" className="text-sm font-bold text-slate-900">
                Pusat Informasi & Edukasi Donor Darah
              </h3>
              <p className="text-[11px] text-slate-500">
                Pedoman medis resmi dan prosedur donor darah sukarela wilayah Cirebon
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 px-6 pt-2.5 border-b border-slate-100 bg-slate-50/30 overflow-x-auto text-xs shrink-0 font-semibold">
          {[
            { id: 'criteria', label: 'Syarat & Kriteria' },
            { id: 'prep', label: 'Persiapan & Perawatan' },
            { id: 'procedure', label: 'Prosedur di UTD' },
            { id: 'locations', label: 'Lokasi UTD Cirebon' },
            { id: 'faq', label: 'Tanya Jawab (FAQ)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-red-600 text-red-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: SYARAT & KRITERIA */}
          {activeTab === 'criteria' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <Heart className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-950 text-sm">Standar Keselamatan Medis Pendonor</h4>
                  <p className="text-[11px] text-red-900 mt-1 leading-relaxed">
                    Setiap pendonor harus memenuhi kriteria fisik yang telah ditetapkan standar Kementerian Kesehatan RI dan Palang Merah Indonesia untuk memastikan keselamatan pendonor maupun penerima darah.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Usia</span>
                  <div className="font-bold text-slate-900 text-sm">17 – 65 Tahun</div>
                  <p className="text-[11px] text-slate-500">Usia 17 tahun diperbolehkan jika telah memiliki KTP atau izin tertulis orang tua.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Berat Badan</span>
                  <div className="font-bold text-slate-900 text-sm">Minimal 45 kg</div>
                  <p className="text-[11px] text-slate-500">Untuk pengambilan 350 ml darah. Berat ≥ 55 kg dapat mendonorkan 450 ml.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Kadar Hemoglobin (Hb)</span>
                  <div className="font-bold text-slate-900 text-sm">12.5 – 17.0 g/dL</div>
                  <p className="text-[11px] text-slate-500">Diperiksa di lokasi oleh petugas UTD menggunakan alat cek Hb standar.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">Tekanan Darah</span>
                  <div className="font-bold text-slate-900 text-sm">100/70 – 150/90 mmHg</div>
                  <p className="text-[11px] text-slate-500">Sistole 100–150 mmHg dan diastole 70–90 mmHg saat pemeriksaan fisik.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Jeda Interval Waktu Donor</span>
                </div>
                <p className="leading-relaxed">
                  Donor darah Whole Blood wajib memiliki jeda minimal <strong>60 hari (2 bulan)</strong> sejak donor terakhir, guna memberikan waktu sumsum tulang memproduksi sel darah merah baru secara optimal.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PERSIAPAN & PERAWATAN */}
          {activeTab === 'prep' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-slate-700" />
                  <span>Persiapan Sebelum Datang ke UTD PMI</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-800">1. Istirahat Cukup</strong>
                    <span className="text-[11px] text-slate-500">Tidur malam minimal 5 jam sebelum donor. Jangan begadang.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-800">2. Minum Air yang Cukup</strong>
                    <span className="text-[11px] text-slate-500">Minum 3–4 gelas air putih (~500ml) sebelum pengambilan darah.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-800">3. Konsumsi Makanan Sehat</strong>
                    <span className="text-[11px] text-slate-500">Makan minimal 3 jam sebelum donor. Hindari gorengan berlemak tinggi.</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <strong className="block text-slate-800">4. Bebas Obat & Vaksin</strong>
                    <span className="text-[11px] text-slate-500">Bebas antibiotik minimal 3 hari dan bebas aspirin 48 jam.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Perawatan Pasca Pengambilan Darah</span>
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                  <li>Istirahat minimal 10–15 menit di ruang pemulihan UTD sambil menikmati makanan ringan dan suplemen yang disediakan.</li>
                  <li>Jangan mengangkat beban berat dengan lengan tempat jarum ditusukkan selama 4–6 jam.</li>
                  <li>Tingkatkan asupan cairan selama 24–48 jam pasca donor.</li>
                  <li>Bila merasa pusing, segera berbaring dan angkat kedua kaki lebih tinggi dari kepala.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: PROSEDUR TAHAPAN DI UTD */}
          {activeTab === 'procedure' && (
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'Registrasi & Identifikasi',
                  desc: 'Tunjukkan nomor antrean digital DONORLINK atau KTP di loket resepsionis UTD PMI.'
                },
                {
                  step: '2',
                  title: 'Pemeriksaan Kesehatan Awal',
                  desc: 'Petugas memeriksa berat badan, denyut nadi, tekanan darah, dan kadar hemoglobin (Hb) dengan jarum kapiler steril.'
                },
                {
                  step: '3',
                  title: 'Pengambilan Darah (Aftap)',
                  desc: 'Proses pengambilan Whole Blood 350ml / 450ml berlangsung sekitar 8–12 menit dalam kondisi berbaring relaks.'
                },
                {
                  step: '4',
                  title: 'Pemulihan & Edukasi',
                  desc: 'Pemberian plester tekan, istirahat 15 menit, serta konsumsi suplemen zat besi dan biskuit energi.'
                },
                {
                  step: '5',
                  title: 'Uji Saring Laboratorium (IMLTD)',
                  desc: 'Darah diuji saring di laboratorium UTD terhadap 4 parameter infeksi menular (HIV, Hep B, Hep C, Sifilis) sebelum disetujui untuk transfusi.'
                }
              ].map(item => (
                <div key={item.step} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-red-700 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{item.title}</h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: LOKASI UTD CIREBON */}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              {pmiFacilities.map(f => (
                <div key={f.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                      24 JAM
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <span>{f.address}, {f.city}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] flex items-center gap-2 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Jam Operasional: {f.operationHours}</span>
                    <span>·</span>
                    <span>Telp: {f.phone}</span>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                Kedua UTD PMI di atas melayani pengambilan darah sukarela reguler, uji silang serasi (crossmatch), dan penerbitan darah transfusi darurat untuk rumah sakit jejaring di wilayah Cirebon.
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & TANYA JAWAB */}
          {activeTab === 'faq' && (
            <div className="space-y-2.5">
              {INITIAL_FAQS.map((item: FaqItem, idx: number) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50"
                    >
                      <span className="font-bold text-slate-900 text-xs">{item.question}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5 leading-relaxed bg-slate-50/50 whitespace-pre-line">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom CTA */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 italic text-center sm:text-left">
            Siap mendonorkan darah sukarela hari ini?
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenBooking && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <Droplet className="w-4 h-4" />
                <span>Booking Antrean Donor</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
