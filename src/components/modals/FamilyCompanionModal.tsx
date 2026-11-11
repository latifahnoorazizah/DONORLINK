import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  ShieldCheck, 
  Check, 
  Phone, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest, FamilyCompanion } from '../../types';

interface FamilyCompanionModalProps {
  request: BloodRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FamilyCompanionModal: React.FC<FamilyCompanionModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  const { addFamilyCompanion, removeFamilyCompanion, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Saudara Kandung');
  const [canView, setCanView] = useState(true);
  const [canChat, setCanChat] = useState(true);
  const [canConfirm, setCanConfirm] = useState(false);

  if (!isOpen || !request) return null;

  const companions = request.familyCompanions || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast({
        type: 'warning',
        title: 'Data Belum Lengkap',
        message: 'Harap lengkapi nama pendamping dan nomor WhatsApp.'
      });
      return;
    }

    const perms: ('VIEW' | 'CHAT' | 'CONFIRM')[] = [];
    if (canView) perms.push('VIEW');
    if (canChat) perms.push('CHAT');
    if (canConfirm) perms.push('CONFIRM');

    addFamilyCompanion(request.id, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      relationship,
      permissions: perms
    });

    setFullName('');
    setPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Kelola Pendamping Keluarga (Family Companion)
              </h3>
              <p className="text-[11px] text-slate-500">
                Permohonan #{request.id} · {request.patientIdentifier}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Active Companions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Pendamping Terdaftar ({companions.length})
              </span>
              <span className="text-[10px] text-slate-400">Hak Akses Terisolasi</span>
            </div>

            {companions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                Belum ada anggota keluarga yang ditambahkan sebagai pendamping permohonan ini.
              </div>
            ) : (
              <div className="space-y-2">
                {companions.map(comp => (
                  <div 
                    key={comp.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{comp.fullName}</span>
                        <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.2 rounded border border-blue-100">
                          {comp.relationship}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{comp.phone}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {comp.permissions.map(p => (
                          <span key={p} className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {p === 'VIEW' ? 'Pantau Status' : p === 'CHAT' ? 'Kirim Chat' : 'Konfirmasi Hadir'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFamilyCompanion(request.id, comp.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Cabut izin pendamping"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Companion Form */}
          <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Tambah Pendamping Baru</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Rina Wahyuni"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nomor WhatsApp:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hubungan dengan Pasien:</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white font-medium"
              >
                <option value="Suami / Istri">Suami / Istri</option>
                <option value="Anak Kandung">Anak Kandung</option>
                <option value="Orang Tua">Orang Tua</option>
                <option value="Saudara Kandung">Saudara Kandung</option>
                <option value="Kerabat / Rekan">Kerabat / Rekan</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Izin Akses yang Diberikan:</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canView}
                    onChange={(e) => setCanView(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Boleh memantau proses pencarian dan status kantong darah</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canChat}
                    onChange={(e) => setCanChat(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Boleh mengirim pesan chat koordinasi dengan relawan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canConfirm}
                    onChange={(e) => setCanConfirm(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Boleh mengonfirmasi kedatangan relawan di rumah sakit</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer mt-1"
            >
              Simpan Pendamping Keluarga
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
