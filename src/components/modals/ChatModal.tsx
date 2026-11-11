import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  MessageSquare, 
  Archive, 
  CheckCheck, 
  Clock, 
  ChevronRight, 
  Flag, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatThread, ChatMessage } from '../../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReportAbuse?: (requestId?: string, title?: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  onOpenReportAbuse
}) => {
  const { 
    currentUser, 
    chatThreads, 
    chatMessages, 
    sendMessage, 
    toggleWhatsAppShare, 
    activeChatThreadId, 
    setActiveChatThreadId, 
    archiveChatThread,
    requests,
    showToast 
  } = useApp();

  const [messageInput, setMessageInput] = useState('');
  const [filterArchived, setFilterArchived] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter threads that involve the current user (either as donor or as requester)
  const userThreads = chatThreads.filter(t => {
    const isParticipant = t.donorId === currentUser.id || t.requesterId === currentUser.id;
    if (!isParticipant) return false;
    if (filterArchived) return t.isArchived;
    return !t.isArchived;
  });

  const activeThread = chatThreads.find(t => t.id === activeChatThreadId) || userThreads[0];

  const threadMessages = activeThread 
    ? chatMessages.filter(m => m.threadId === activeThread.id)
    : [];

  useEffect(() => {
    if (userThreads.length > 0 && !activeChatThreadId) {
      setActiveChatThreadId(userThreads[0].id);
    }
  }, [userThreads, activeChatThreadId, setActiveChatThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !messageInput.trim()) return;
    sendMessage(activeThread.id, messageInput.trim());
    setMessageInput('');
  };

  const handleQuickReply = (text: string) => {
    if (!activeThread) return;
    sendMessage(activeThread.id, text, true);
  };

  const quickReplies = currentUser.role === 'DONOR' ? [
    'Saya sedang dalam perjalanan menuju rumah sakit.',
    'Apakah berkas transfusi dari dokter sudah siap di loket BDRS?',
    'Saya sudah tiba di lokasi faskes.',
    'Bisa tolong konfirmasi ruangan pasien?'
  ] : [
    'Terima kasih banyak, berkas sudah standby di loket BDRS.',
    'Silakan langsung menuju ruang BDRS / Bank Darah.',
    'Pasien berada di ruang perawatan, keluarga menunggu di lobi.',
    'Nomor WhatsApp saya bagikan agar mudah koordinasi di lokasi.'
  ];

  const isCurrentRequester = activeThread && currentUser.id === activeThread.requesterId;
  const isOpponentPhoneShared = activeThread 
    ? (isCurrentRequester ? activeThread.isDonorPhoneShared : activeThread.isRequesterPhoneShared)
    : false;
  const opponentPhone = activeThread 
    ? (isCurrentRequester ? activeThread.donorPhone : activeThread.requesterPhone)
    : '';
  const myPhoneShared = activeThread
    ? (isCurrentRequester ? activeThread.isRequesterPhoneShared : activeThread.isDonorPhoneShared)
    : false;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-4xl h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Ruang Komunikasi Terverifikasi DONORLINK
              </h3>
              <p className="text-[11px] text-slate-500">
                Koordinasi aman antara pendonor dan keluarga pasien terkait permohonan darah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterArchived(!filterArchived)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                filterArchived 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{filterArchived ? 'Lihat Aktif' : 'Arsip'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Body: Left List, Right Active Conversation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Threads List */}
          <div className="w-72 sm:w-80 border-r border-slate-100 flex flex-col bg-slate-50/40 shrink-0">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Percakapan ({userThreads.length})</span>
              <span className="text-[10px] font-mono text-slate-400">ID Terkait</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {userThreads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada percakapan aktif. Percakapan akan otomatis terbentuk ketika pendonor menyatakan komitmen pada permohonan darah.
                </div>
              ) : (
                userThreads.map(thread => {
                  const isSelected = activeThread?.id === thread.id;
                  const opponentName = currentUser.id === thread.requesterId ? thread.donorName : thread.requesterName;
                  const opponentRole = currentUser.id === thread.requesterId ? 'Pendonor Sukarela' : 'Keluarga Pasien';

                  return (
                    <button
                      key={thread.id}
                      onClick={() => setActiveChatThreadId(thread.id)}
                      className={`w-full p-3.5 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                        isSelected ? 'bg-white shadow-2xs border-l-4 border-rose-600' : 'hover:bg-white/80'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-black text-xs shrink-0 uppercase">
                        {opponentName.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {opponentName}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(thread.lastMessageTimestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10px] text-rose-700 font-semibold truncate mt-0.5">
                          #{thread.requestId} · {thread.patientIdentifier}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {thread.lastMessageText}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Area: Messages View & Input */}
          {activeThread ? (
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Thread Top Context Bar */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex flex-col items-center justify-center font-bold text-xs shrink-0">
                    <span>{activeThread.donorBloodType}</span>
                    <span className="text-[9px] font-mono leading-none">
                      {activeThread.donorRhesus === 'POSITIVE' ? '(+)' : '(-)'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        {currentUser.id === activeThread.requesterId ? activeThread.donorName : activeThread.requesterName}
                      </h4>
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.2 rounded border border-rose-100">
                        ID: #{activeThread.requestId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pasien: <strong className="text-slate-700">{activeThread.patientIdentifier}</strong> di {activeThread.hospitalName}
                    </p>
                  </div>
                </div>

                {/* WhatsApp & Reporting Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWhatsAppShare(activeThread.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      myPhoneShared 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{myPhoneShared ? 'Nomor WA Dibagikan' : 'Bagikan Nomor WA'}</span>
                  </button>

                  <button
                    onClick={() => archiveChatThread(activeThread.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title={activeThread.isArchived ? 'Buka dari arsip' : 'Arsipkan percakapan'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  {onOpenReportAbuse && (
                    <button
                      onClick={() => onOpenReportAbuse(activeThread.requestId, `Laporan thread chat dengan ${activeThread.donorName}`)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Laporkan indikasi calo atau kecurigaan"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Shared WhatsApp Contact Notification Bar if shared */}
              {isOpponentPhoneShared && (
                <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Lawan bicara membagikan nomor WhatsApp resmi: <strong>{opponentPhone}</strong></span>
                  </div>
                  <a
                    href={`https://wa.me/${opponentPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    Buka WhatsApp
                  </a>
                </div>
              )}

              {/* Message History View */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/30">
                {threadMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSystem = msg.senderId === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="max-w-md px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200/80 text-center text-[11px] text-slate-600 leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }

                  const targetReq = activeThread ? requests.find(r => r.id === activeThread.requestId) : undefined;
                  const companion = targetReq?.familyCompanions?.find(c => c.matchedUserId === msg.senderId);
                  const senderBadge = companion 
                    ? `Pendamping (${companion.relationship})`
                    : msg.senderRole === 'DONOR'
                    ? 'Relawan Donor'
                    : msg.senderRole === 'HOSPITAL'
                    ? 'BDRS Rumah Sakit'
                    : 'Pemohon Pasien';

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">{isMe ? 'Anda' : msg.senderName}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                          {senderBadge}
                        </span>
                        <span>·</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                        isMe 
                          ? 'bg-slate-900 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies Bar */}
              <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-rose-500" /> Balas Cepat:
                </span>
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ketik pesan koordinasi donor di sini..."
                  className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-rose-600"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Pilih salah satu percakapan di sebelah kiri untuk melihat pesan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
