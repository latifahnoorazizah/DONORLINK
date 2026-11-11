import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Building2, 
  CheckCircle2, 
  Ticket, 
  AlertCircle, 
  ShieldCheck,
  RotateCcw,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DonorBooking } from '../../types';

interface VoluntaryBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated?: (booking: DonorBooking) => void;
  reschedulingBooking?: DonorBooking | null;
}

const DEFAULT_SLOT_QUOTA = 20;

export const VoluntaryBookingModal: React.FC<VoluntaryBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingCreated,
  reschedulingBooking
}) => {
  const { 
    currentUser,
    facilities, 
    donorBookings,
    createDonorBooking, 
    rescheduleDonorBooking,
    showToast 
  } = useApp();

  const pmiFacilities = facilities.filter(f => f.type === 'UTD_PMI');

  const [selectedFacilityId, setSelectedFacilityId] = useState(
    reschedulingBooking?.facilityId || pmiFacilities[0]?.id || 'fac-pmi-kotacirebon'
  );
  const [bookingDate, setBookingDate] = useState(() => {
    if (reschedulingBooking?.bookingDate) {
      return reschedulingBooking.bookingDate;
    }
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<DonorBooking['timeSlot']>(
    reschedulingBooking?.timeSlot || '08:00 - 10:00'
  );
  const [hasConfirmedHealth, setHasConfirmedHealth] = useState(false);

  if (!isOpen) return null;

  // Check if current user already has any active unfinished booking (status BOOKED, CHECKED_IN, SCREENING_PASSED)
  // Antrean berstatus DONATION_COMPLETED (Selesai), CANCELLED, atau RESCHEDULED TIDAK menghalangi pembuatan antrean baru.
  const activeUnfinishedBooking = donorBookings.find(b => 
    b.donorId === currentUser.id &&
    (b.status === 'BOOKED' || b.status === 'CHECKED_IN' || b.status === 'SCREENING_PASSED') &&
    (!reschedulingBooking || b.id !== reschedulingBooking.id)
  );

  // Calculate live slot quota for the selected facility & date
  const getSlotAvailability = (slot: DonorBooking['timeSlot']) => {
    const bookedCount = donorBookings.filter(b => 
      b.facilityId === selectedFacilityId &&
      b.bookingDate === bookingDate &&
      b.timeSlot === slot &&
      b.status !== 'CANCELLED' &&
      b.status !== 'RESCHEDULED'
    ).length;

    const remaining = Math.max(0, DEFAULT_SLOT_QUOTA - bookedCount);
    return { bookedCount, remaining, totalQuota: DEFAULT_SLOT_QUOTA };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasConfirmedHealth) {
      showToast({
        type: 'warning',
        title: 'Konfirmasi Kesiapan Kesehatan',
        message: 'Mohon centang pernyataan bahwa Anda merasa sehat dan cukup istirahat sebelum mengambil antrean donor.'
      });
      return;
    }

    if (activeUnfinishedBooking && !reschedulingBooking) {
      showToast({
        type: 'warning',
        title: 'Satu Antrean Aktif Diizinkan',
        message: `Anda masih memiliki tiket antrean aktif (${activeUnfinishedBooking.queueNumber}) di ${activeUnfinishedBooking.facilityName} pada tanggal ${activeUnfinishedBooking.bookingDate}. Selesaikan atau batalkan tiket tersebut terlebih dahulu sebelum mengambil antrean baru.`
      });
      return;
    }

    const slotAvail = getSlotAvailability(timeSlot);
    if (slotAvail.remaining <= 0) {
      showToast({
        type: 'error',
        title: 'Slot Kuota Penuh',
        message: `Mohon pilih slot waktu kedatangan lain karena kuota ${timeSlot} sudah terisi penuh (20/20).`
      });
      return;
    }

    if (reschedulingBooking) {
      const updated = rescheduleDonorBooking(reschedulingBooking.id, bookingDate, timeSlot);
      if (updated && onBookingCreated) {
        onBookingCreated(updated);
      }
    } else {
      const newBooking = createDonorBooking({
        facilityId: selectedFacilityId,
        bookingDate,
        timeSlot
      });

      if (onBookingCreated) {
        onBookingCreated(newBooking);
      }
    }

    onClose();
  };

  const selectedPmi = facilities.find(f => f.id === selectedFacilityId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${reschedulingBooking ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
              {reschedulingBooking ? <RotateCcw className="w-5 h-5" /> : <Ticket className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {reschedulingBooking ? 'Jadwalkan Ulang Tiket Antrean Donor' : 'Booking Jadwal Donor Darah Sukarela'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {reschedulingBooking 
                  ? `Mengganti tiket #${reschedulingBooking.id} (Antrean: ${reschedulingBooking.queueNumber || '-'})`
                  : 'Layanan donor reguler langsung di UTD Palang Merah Indonesia (PMI) Cirebon'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Facility Selection */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Pilih Unit Transfusi Darah (UTD):
            </label>
            <div className="space-y-2">
              {pmiFacilities.map(f => {
                const isSelected = selectedFacilityId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFacilityId(f.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'border-red-600 bg-red-50/70 ring-1 ring-red-600' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{f.name}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{f.address}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{f.city} · Jam: {f.operationHours}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-red-700 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Tanggal Kunjungan Donor:
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-red-600 bg-white"
            />
          </div>

          {/* Duplicate active booking notice */}
          {activeUnfinishedBooking && !reschedulingBooking && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Perhatian: Anda Masih Memiliki Antrean PMI Aktif</strong>
                <span>Anda telah terdaftar pada nomor antrean {activeUnfinishedBooking.queueNumber} ({activeUnfinishedBooking.timeSlot} - {activeUnfinishedBooking.bookingDate}). Sesuai aturan sistem, selesaikan atau batalkan tiket tersebut sebelum mengambil antrean baru.</span>
              </div>
            </div>
          )}

          {/* Time Slot Picker with Live Slot Quota */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                Pilih Slot Waktu & Sisa Kuota Petugas:
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Maksimal 20 orang/slot
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'] as DonorBooking['timeSlot'][]).map(slot => {
                const isSelected = timeSlot === slot;
                const { bookedCount, remaining, totalQuota } = getSlotAvailability(slot);
                const isFull = remaining === 0;

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isFull}
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isFull
                        ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                        : isSelected 
                          ? 'border-red-600 bg-red-50 text-red-900 ring-1 ring-red-600' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{slot}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-red-700 shrink-0" />}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] font-mono">
                      <span className={remaining <= 5 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                        {isFull ? 'PENUH' : `Sisa ${remaining} kuota`}
                      </span>
                      <span className="text-slate-400">{bookedCount}/{totalQuota}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Confirmation Notice */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedHealth}
                onChange={(e) => setHasConfirmedHealth(e.target.checked)}
                className="mt-0.5 rounded text-red-700 focus:ring-red-500"
              />
              <span className="text-[11px] text-slate-600 leading-relaxed">
                Saya menyatakan dalam kondisi fit, tidur minimal 5 jam tadi malam, tidak sedang meminum antibiotik/obat keras, dan berat badan saya memenuhi syarat (≥ 45 kg).
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={Boolean(activeUnfinishedBooking && !reschedulingBooking)}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>{reschedulingBooking ? 'Simpan Jadwal Baru' : 'Ambil Antrean & Konfirmasi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
