import React, { useState } from 'react';
import { 
  HeartHandshake, 
  User as UserIcon, 
  Bell, 
  ChevronDown, 
  Check, 
  RotateCcw,
  ShieldCheck, 
  Building2, 
  Syringe, 
  Search, 
  CreditCard,
  LogOut,
  Settings,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenDisclaimer: () => void;
  onOpenEducation?: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenDonorCard: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenDisclaimer,
  onOpenEducation,
  onOpenNotifications,
  onOpenProfile,
  onOpenDonorCard,
  onOpenChat
}) => {
  const { 
    currentUser, 
    switchRole, 
    allUsers, 
    resetAllData, 
    notifications,
    logoutUser,
    isAuthenticated
  } = useApp();
  
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleMeta: Record<UserRole, { label: string; icon: React.ReactNode; colorClass: string; dashboardView: string }> = {
    DONOR: {
      label: 'Pendonor Sukarela',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />,
      colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
      dashboardView: 'donor-dashboard'
    },
    REQUESTER: {
      label: 'Pencari Donor',
      icon: <Search className="w-3.5 h-3.5 text-blue-600" />,
      colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
      dashboardView: 'requester-dashboard'
    },
    HOSPITAL: {
      label: 'Rumah Sakit (BDRS)',
      icon: <Building2 className="w-3.5 h-3.5 text-amber-700" />,
      colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      dashboardView: 'hospital-dashboard'
    },
    UTD_PMI: {
      label: 'PMI / UTD Wilayah',
      icon: <Syringe className="w-3.5 h-3.5 text-red-700" />,
      colorClass: 'text-red-800 bg-red-50 border-red-200',
      dashboardView: 'pmi-dashboard'
    },
    ADMIN: {
      label: 'Administrator',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />,
      colorClass: 'text-purple-800 bg-purple-50 border-purple-200',
      dashboardView: 'admin-dashboard'
    }
  };

  const handleSelectRole = (role: UserRole) => {
    switchRole(role);
    setIsPersonaMenuOpen(false);
    onNavigate(roleMeta[role].dashboardView);
  };

  const handleLogout = () => {
    logoutUser();
    setIsPersonaMenuOpen(false);
    onNavigate('auth');
  };

  // Check if current user is a public user with dual capabilities
  const isDualPublicUser = currentUser.isDonorEnabled && currentUser.isRequesterEnabled && 
    (currentUser.role === 'DONOR' || currentUser.role === 'REQUESTER');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark with official Mega Mendung Logo */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center text-left group cursor-pointer focus:outline-hidden"
            aria-label="Kembali ke Beranda DONORLINK"
          >
            <BrandLogo 
              variant="horizontal" 
              imgClassName="h-9 sm:h-10" 
              showSubtitle={true} 
              subtitleText="Kota & Kab. Cirebon" 
            />
          </button>
        </div>

        {/* Dual-feature switch if user has both capabilities activated */}
        {isDualPublicUser && (
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-[11px] font-semibold">
            <button
              onClick={() => {
                if (currentUser.role !== 'DONOR') switchRole('DONOR');
                onNavigate('donor-dashboard');
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentUser.role === 'DONOR' && currentView.includes('donor')
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-600" />
              <span>Mode Pendonor</span>
            </button>
            <button
              onClick={() => {
                if (currentUser.role !== 'REQUESTER') switchRole('REQUESTER');
                onNavigate('requester-dashboard');
              }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                currentUser.role === 'REQUESTER' && currentView.includes('requester')
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Mode Pencari</span>
            </button>
          </div>
        )}

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'landing' ? 'text-rose-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Beranda Publik
          </button>
          
          <button
            onClick={() => onNavigate(roleMeta[currentUser.role].dashboardView)}
            className={`transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
              currentView.includes('dashboard') ? 'text-rose-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <span>Dashboard {roleMeta[currentUser.role].label}</span>
          </button>

          <button
            onClick={() => onNavigate('matching-browser')}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'matching-browser' ? 'text-rose-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Daftar Kebutuhan Darah
          </button>

          {onOpenEducation && (
            <button
              onClick={onOpenEducation}
              className="text-slate-600 hover:text-rose-700 transition-colors py-1 cursor-pointer flex items-center gap-1 font-semibold"
            >
              <span>Edukasi Donor</span>
            </button>
          )}

          <button
            onClick={onOpenDisclaimer}
            className="text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer flex items-center gap-1"
          >
            <span>Pedoman Medis</span>
          </button>
        </nav>

        {/* Zone 3: Role Persona Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* In-app Chat Button */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Pesan Dalam Aplikasi"
              aria-label="Pesan Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Pemberitahuan Sistem"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600"></span>
            )}
          </button>

          {/* Persona Menu & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
              className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-1.5">
                {roleMeta[currentUser.role]?.icon}
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-wider font-mono">
                    {currentUser.role}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPersonaMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                {/* User Identity Details & Direct Profile Actions */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 leading-snug">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {currentUser.phone}
                      </p>
                    </div>
                    {currentUser.donorIdNumber && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {currentUser.donorIdNumber}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setIsPersonaMenuOpen(false);
                        onOpenProfile();
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Settings className="w-3 h-3 text-slate-500" />
                      <span>Edit Profil</span>
                    </button>

                    {currentUser.isDonorEnabled ? (
                      <button
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          onOpenDonorCard();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <CreditCard className="w-3 h-3 text-rose-600" />
                        <span>Kartu Donor</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsPersonaMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-500 text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>+ Buka Donor</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 5 Role Switcher section */}
                <div className="px-3.5 py-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Simulasi 5 Role (Terisolasi):
                  </p>
                </div>

                <div className="py-1">
                  {(Object.keys(roleMeta) as UserRole[]).map(r => {
                    const sampleUser = allUsers.find(u => u.role === r) || currentUser;
                    const isActive = currentUser.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleSelectRole(r)}
                        className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors cursor-pointer ${
                          isActive ? 'bg-slate-100/90' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 rounded-lg bg-slate-100">
                            {roleMeta[r].icon}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 leading-tight">
                              {roleMeta[r].label}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {sampleUser.fullName}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Footer Controls: Reset & Logout */}
                <div className="px-3.5 pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      resetAllData();
                      setIsPersonaMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 transition-colors font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Data</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Quick CTA */}
          <button
            onClick={() => onNavigate('requests-create')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>+ Butuh Darah</span>
          </button>
        </div>
      </div>
    </header>
  );
};
