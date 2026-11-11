import React from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { BloodRequest, UserRole } from '../../types';

interface RequestCardProps {
  request: BloodRequest;
  onViewDetail: (request: BloodRequest) => void;
  onCommit?: (request: BloodRequest) => void;
  currentUserRole?: UserRole;
  isCommittedByCurrentUser?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onViewDetail,
  onCommit,
  currentUserRole,
  isCommittedByCurrentUser
}) => {
  const isCritical = request.urgency === 'CRITICAL_24H';
  const isUrgent = request.urgency === 'URGENT_48H';
  
  // Format component label
  const componentLabels: Record<string, string> = {
    WHOLE_BLOOD: 'Darah Lengkap (WB)',
    PRC: 'Sel Darah Merah (PRC)',
    THROMBOCYTE: 'Trombosit Konsentrat (TC)',
    FFP: 'Fresh Frozen Plasma (FFP)',
    CRYOPRECIPITATE: 'Kriopresipitat'
  };

  const statusLabels: Record<string, { text: string; colorClass: string }> = {
    OPEN: { text: 'Mencari Relawan', colorClass: 'text-amber-800' },
    PARTIALLY_FULFILLED: { text: 'Terpenuhi Sebagian', colorClass: 'text-blue-800' },
    CLOSED_FULFILLED: { text: 'Kebutuhan Selesai', colorClass: 'text-emerald-800' },
    CLOSED_EXPIRED: { text: 'Kedaluwarsa', colorClass: 'text-slate-600' },
    CANCELLED: { text: 'Dibatalkan', colorClass: 'text-rose-800' }
  };

  const percentFulfilled = Math.min(100, Math.round((request.bagsFulfilled / request.bagsNeeded) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top clean unboxed metadata with typographic separators */}
        <div className="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-800">
              {request.city}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              request.source === 'HOSPITAL' 
                ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                : 'bg-blue-100 text-blue-900 border border-blue-200'
            }`}>
              {request.source === 'HOSPITAL' ? 'RS' : 'Keluarga'}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{componentLabels[request.componentType] || request.componentType}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-[11px] text-slate-600">
              #{request.id}
            </span>
          </div>

          <div className="flex items-center gap-1 font-medium text-xs">
            {request.verificationStatus === 'VERIFIED_BY_HOSPITAL' ? (
              <span className="text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Terverifikasi Faskes
              </span>
            ) : (
              <span className="text-slate-600">
                Menunggu Verifikasi
              </span>
            )}
          </div>
        </div>

        {/* Primary Blood Specifier & Patient Initial */}
        <div className="mt-4 flex items-start gap-4">
          {/* Blood Type Box */}
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-rose-700">
            <span className="font-bold text-2xl tracking-tighter leading-none">
              {request.bloodType}
            </span>
            <span className="text-xs font-semibold text-rose-600 uppercase font-mono mt-0.5">
              Rh {request.rhesus === 'POSITIVE' ? '(+)' : '(-)'}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-slate-900 truncate">
              {request.patientIdentifier}
            </h4>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="font-medium text-slate-700 truncate">{request.hospitalName}</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Ruang / Bangsal: {request.hospitalRoom}
            </div>
          </div>
        </div>

        {/* Diagnosis Note Snippet */}
        {request.diagnosisNotes && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            {request.diagnosisNotes}
          </p>
        )}

        {/* Bag Fulfillment Metric */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">Progres Kebutuhan:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-800">
              {request.bagsFulfilled} / {request.bagsNeeded} Kantong Terpenuhi
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                percentFulfilled >= 100 
                  ? 'bg-emerald-600' 
                  : percentFulfilled > 0 
                  ? 'bg-blue-600' 
                  : 'bg-rose-600'
              }`}
              style={{ width: `${percentFulfilled}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="text-xs flex items-center gap-1.5 font-medium">
          <span className={statusLabels[request.status]?.colorClass || 'text-slate-600'}>
            {statusLabels[request.status]?.text || request.status}
          </span>
          {isCritical && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-rose-700 font-semibold flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                24 Jam
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetail(request)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Lihat Detail
          </button>

          {currentUserRole === 'DONOR' && request.status !== 'CLOSED_FULFILLED' && onCommit && (
            <button
              onClick={() => onCommit(request)}
              disabled={isCommittedByCurrentUser}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                isCommittedByCurrentUser
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
              }`}
            >
              <span>{isCommittedByCurrentUser ? 'Telah Bersedia' : 'Bantu Donor'}</span>
              {!isCommittedByCurrentUser && <ArrowRight className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
