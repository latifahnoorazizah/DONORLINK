import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  X, 
  Clock, 
  Info,
  Ticket,
  Users,
  Package,
  Flag,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

export const NotificationDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = [
    { id: 'ALL', label: 'Semua' },
    { id: 'BOOKING', label: 'Antrean PMI' },
    { id: 'REQUEST', label: 'Permintaan' },
    { id: 'STOCK', label: 'Stok UTD' },
    { id: 'REPORT', label: 'Pengaduan' },
    { id: 'SYSTEM', label: 'Sistem' }
  ];

  const filteredNotifs = notifications.filter(n => {
    if (selectedCategory === 'ALL') return true;
    return n.category === selectedCategory;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getCategoryBadge = (cat?: NotificationItem['category']) => {
    switch (cat) {
      case 'DONOR':
      case 'BOOKING':
      case 'QUEUE':
        return <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">PENDONOR</span>;
      case 'REQUESTER':
      case 'REQUEST':
        return <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">PEMOHON</span>;
      case 'HOSPITAL':
        return <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">FASKES BDRS</span>;
      case 'UTD_PMI':
      case 'STOCK':
        return <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">UTD PMI</span>;
      case 'ADMIN':
      case 'REPORT':
        return <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">SUPER ADMIN</span>;
      default:
        return <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">SISTEM</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      <div className="bg-white h-full max-w-sm w-full p-5 shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-700" />
              <h3 className="font-bold text-sm text-slate-900">Pemberitahuan Sistem</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>{unreadCount} pesan belum dibaca</span>
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-rose-700 hover:text-rose-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai Semua Dibaca
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 shrink-0 text-[11px]">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 mt-1 pr-1">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada notifikasi dalam kategori ini.
              </div>
            ) : (
              filteredNotifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                    notif.isRead
                      ? 'bg-white border-slate-200/80 text-slate-600'
                      : 'bg-rose-50/50 border-rose-200 text-slate-900 font-medium shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      {getCategoryBadge(notif.category)}
                      <span className="font-semibold text-slate-800 leading-tight">{notif.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
