import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ChevronDown, 
  Minimize2, 
  Maximize2, 
  AlertCircle, 
  HelpCircle,
  MapPin,
  Clock,
  Heart
} from 'lucide-react';
import { ChatbotMessage } from '../../types';

export const DonorLinkAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatbotMessage[]>([
    {
      id: 'bot-init',
      sender: 'assistant',
      text: 'Halo! Saya DONORLINK Assistant. Saya siap menjawab pertanyaan seputar donor darah sukarela di Kota & Kabupaten Cirebon, alur BDRS rumah sakit, dan interval donor.',
      quickOptions: [
        'Syarat donor darah',
        'Interval jeda donor 60 hari',
        'Lokasi UTD PMI di Cirebon',
        'Alur transfusi di Rumah Sakit'
      ],
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Intelligent local Cirebon knowledge-base responder
  const generateAssistantResponse = (query: string): { text: string; options?: string[] } => {
    const q = query.toLowerCase();

    if (q.includes('syarat') || q.includes('kriteria') || q.includes('boleh donor')) {
      return {
        text: 'Syarat umum calon pendonor darah di UTD PMI Cirebon:\n1. Usia 17–60 tahun (sampai 65 tahun jika rutin donor).\n2. Berat badan minimal 45 kg (Whole Blood) atau 55 kg (Apheresis).\n3. Kadar Hemoglobin (Hb) 12,5 – 17,0 g/dL.\n4. Tekanan darah normal (Sistole 100–150 mmHg, Diastole 70–90 mmHg).\n5. Istirahat/tidur minimal 5 jam sebelum donor.\n6. Tidak meminum obat antibiotik dalam 3 hari terakhir.',
        options: ['Interval jeda donor 60 hari', 'Lokasi UTD PMI di Cirebon', 'Apakah donor sakit?']
      };
    }

    if (q.includes('interval') || q.includes('jeda') || q.includes('60') || q.includes('kapan boleh')) {
      return {
        text: 'Interval standar donor darah Whole Blood menurut standar Permenkes dan PMI adalah minimal 60 hari (2 bulan) sekali. Jeda ini diperlukan agar tubuh memiliki waktu cukup meregenerasi sel darah merah dan memulihkan cadangan zat besi (feritin). Jika mendonor trombosit (Apheresis), interval dapat lebih singkat (14 hari) dengan rekomendasi dokter UTD.',
        options: ['Syarat donor darah', 'Cek kesiapan profil saya', 'Tips sebelum donor']
      };
    }

    if (q.includes('lokasi') || q.includes('pmi') || q.includes('alamat') || q.includes('cirebon')) {
      return {
        text: 'Unit Transfusi Darah (UTD) resmi di wilayah Cirebon:\n• UTD PMI Kota Cirebon: Jl. DR. Sudarsono No. 14, Kesambi (Layanan 24 Jam, Telp 0231-205650).\n• UTD PMI Kabupaten Cirebon: Jl. Dewi Sartika No. 39, Sumber (Layanan 24 Jam, Telp 0231-321118).\nSelain itu, Bank Darah Rumah Sakit (BDRS) tersedia di RSUD Gunung Jati, RSUD Arjawinangun, RS Ciremai, RS Mitra Plumbon, dan RSUD Waled.',
        options: ['Alur transfusi di Rumah Sakit', 'Syarat donor darah', 'Booking jadwal UTD']
      };
    }

    if (q.includes('alur') || q.includes('transfusi') || q.includes('rumah sakit') || q.includes('bdrs')) {
      return {
        text: 'Alur transfusi darah di Rumah Sakit:\n1. Dokter penanggung jawab menerbitkan formulir permohonan darah darurat.\n2. Keluarga mengajukan permohonan di DONORLINK dengan memilih rumah sakit bersangkutan.\n3. Petugas BDRS memverifikasi berkas.\n4. Calon pendonor yang cocok hadir di lokasi BDRS untuk skrining fisik dan pengambilan sampel crossmatch.\n5. Jika kompatibel, darah ditransfusikan ke pasien di ruang rawat.',
        options: ['Apakah ada biaya darah?', 'Syarat donor darah', 'Laporkan calo']
      };
    }

    if (q.includes('biaya') || q.includes('jual') || q.includes('calo') || q.includes('uang')) {
      return {
        text: 'PERINGATAN PENTING: Darah dari pendonor sukarela TIDAK BOLEH DIPERJUALBELIKAN. Biaya Pengganti Pengolahan Darah (BPPD) di PMI/Rumah Sakit ditanggung oleh BPJS Kesehatan atau asuransi resmi untuk biaya kantong, reagen skrining lab IMLTD, dan rantai dingin. DONORLINK melarang keras segala bentuk imbalan atau pemerasan.',
        options: ['Laporkan indikasi penipuan', 'Syarat donor darah', 'Lokasi UTD PMI di Cirebon']
      };
    }

    if (q.includes('tips') || q.includes('persiapan') || q.includes('sebelum')) {
      return {
        text: 'Tips persiapan sebelum donor:\n• Minum 3–4 gelas air putih 2 jam sebelum donor.\n• Makan makanan bergizi 3 jam sebelum donor (hindari makanan berlemak tinggi).\n• Tidur malam minimal 5–7 jam.\n• Kenakan pakaian dengan lengan yang mudah dilipat.',
        options: ['Syarat donor darah', 'Interval jeda donor 60 hari']
      };
    }

    return {
      text: 'Pertanyaan Anda sangat berharga. DONORLINK berfokus pada pendataan pendonor sukarela dan koordinasi permohonan darah faskes di wilayah Cirebon. Catatan: Asisten ini tidak mengambil keputusan klinis atau mendiagnosis penyakit. Apakah ada hal lain yang ingin Anda ketahui?',
      options: ['Syarat donor darah', 'Interval jeda donor 60 hari', 'Lokasi UTD PMI di Cirebon', 'Alur transfusi di Rumah Sakit']
    };
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatbotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const resp = generateAssistantResponse(text);
      const botMsg: ChatbotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: resp.text,
        quickOptions: resp.options,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl transition-all cursor-pointer group hover:scale-105 active:scale-95 border border-slate-700"
          aria-label="Tanya DONORLINK Assistant"
        >
          <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold block leading-tight flex items-center gap-1">
              DONORLINK Bot
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </span>
            <span className="text-[10px] text-slate-300">Bantuan & FAQ Cirebon</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`w-[92vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all ${
          isMinimized ? 'h-14' : 'h-[500px]'
        } animate-in fade-in slide-in-from-bottom-5`}>
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  DONORLINK Assistant
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    FAQ Bot
                  </span>
                </h4>
                <p className="text-[10px] text-slate-300">Panduan Donor Darah Wilayah Cirebon</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                title={isMinimized ? 'Perbesar' : 'Kecilkan'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Disclaimer Strip */}
              <div className="px-3.5 py-1.5 bg-amber-50 border-b border-amber-100 flex items-center gap-1.5 text-[10px] text-amber-900 shrink-0">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Simulasi informasi panduan. Bukan penentu kelayakan medis fisik.</span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50">
                {messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed whitespace-pre-line text-xs ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.timestamp}</span>

                    {/* Quick Options Chips */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        {msg.quickOptions.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(opt)}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-700 transition-colors cursor-pointer text-left"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanyakan syarat donor, PMI Cirebon..."
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-rose-600"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
