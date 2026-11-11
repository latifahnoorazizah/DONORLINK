import React from 'react';
import { ShieldAlert, ArrowRight, RotateCcw } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleAccessGuardProps {
  currentRole: UserRole;
  requiredRole: UserRole;
  onRedirectToOwnDashboard: () => void;
  onSwitchRole: (role: UserRole) => void;
}

export const RoleAccessGuard: React.FC<RoleAccessGuardProps> = ({
  currentRole,
  requiredRole,
  onRedirectToOwnDashboard,
  onSwitchRole
}) => {
  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Akses Terbatas: Dashboard {requiredRole}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Anda saat ini masuk dengan peran <strong className="text-slate-800">{currentRole}</strong>. Halaman ini hanya dapat diakses oleh akun dengan wewenang <strong className="text-slate-800">{requiredRole}</strong> demi menjaga kerahasiaan dan pemisahan hak akses medis.
        </p>
      </div>

      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={onRedirectToOwnDashboard}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Buka Dashboard {currentRole} Saya</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSwitchRole(requiredRole)}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          Beralih Persona Demo ke {requiredRole}
        </button>
      </div>
    </div>
  );
};
