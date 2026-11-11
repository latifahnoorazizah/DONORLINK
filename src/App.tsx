import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { 
  ToastContainer, 
  SimulationBanner, 
  MedicalDisclaimerBanner, 
  MedicalDisclaimerModal 
} from './components/common/FeedbackComponents';
import { Navbar } from './components/common/Navbar';
import { RoleAccessGuard } from './components/common/RoleAccessGuard';
import { DonorLinkAssistant } from './components/common/DonorLinkAssistant';
import { BrandLogo } from './components/common/BrandLogo';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { MatchingBrowser } from './pages/public/MatchingBrowser';
import { AuthPage } from './pages/auth/AuthPage';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { RequesterDashboard } from './pages/requester/RequesterDashboard';
import { CreateRequestView } from './pages/requester/CreateRequestView';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { PmiDashboard } from './pages/pmi/PmiDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Modals
import { RequestDetailModal } from './components/modals/RequestDetailModal';
import { DonorCommitmentModal } from './components/modals/DonorCommitmentModal';
import { ReportAbuseModal } from './components/modals/ReportAbuseModal';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import { DigitalDonorCardModal } from './components/modals/DigitalDonorCardModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { ChatModal } from './components/modals/ChatModal';
import { VoluntaryBookingModal } from './components/modals/VoluntaryBookingModal';
import { FamilyCompanionModal } from './components/modals/FamilyCompanionModal';
import { BagReceiptModal } from './components/modals/BagReceiptModal';
import { BloodEducationModal } from './components/common/BloodEducationModal';
import { BloodRequest, UserRole, DonorBooking } from './types';

const MainAppContent: React.FC = () => {
  const { currentUser, switchRole, isAuthenticated } = useApp();

  const [currentView, setCurrentView] = useState<string>(() => {
    return isAuthenticated ? 'landing' : 'auth';
  });

  // Modals state
  const [detailRequest, setDetailRequest] = useState<BloodRequest | null>(null);
  const [commitmentRequest, setCommitmentRequest] = useState<BloodRequest | null>(null);
  const [reportRequest, setReportRequest] = useState<BloodRequest | null>(null);
  const [companionRequest, setCompanionRequest] = useState<BloodRequest | null>(null);
  const [bagReceiptRequest, setBagReceiptRequest] = useState<BloodRequest | null>(null);
  
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isDonorCardModalOpen, setIsDonorCardModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState<DonorBooking | null>(null);

  // Routing helper
  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDashboardForRole = (role: UserRole) => {
    switch (role) {
      case 'DONOR': return 'donor-dashboard';
      case 'REQUESTER': return 'requester-dashboard';
      case 'HOSPITAL': return 'hospital-dashboard';
      case 'UTD_PMI': return 'pmi-dashboard';
      case 'ADMIN': return 'admin-dashboard';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900">
      {/* Simulation Banner & Medical Disclaimer */}
      <SimulationBanner />
      <MedicalDisclaimerBanner onOpenDetail={() => setIsDisclaimerModalOpen(true)} />

      {/* Main Top Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenDisclaimer={() => setIsDisclaimerModalOpen(true)}
        onOpenEducation={() => setIsEducationModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsDrawerOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenDonorCard={() => setIsDonorCardModalOpen(true)}
        onOpenChat={() => setIsChatModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* View 1: Public Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={navigateTo}
            onOpenDisclaimer={() => setIsDisclaimerModalOpen(true)}
          />
        )}

        {/* View 2: Matching Browser */}
        {currentView === 'matching-browser' && (
          <MatchingBrowser
            onViewDetail={(req) => setDetailRequest(req)}
            onCommit={(req) => setCommitmentRequest(req)}
            onCreateRequest={() => navigateTo('requests-create')}
          />
        )}

        {/* View 3: Auth & Persona Switcher */}
        {currentView === 'auth' && (
          <AuthPage
            onSuccess={(role) => navigateTo(getDashboardForRole(role))}
          />
        )}

        {/* View 4: Step-by-Step Create Request */}
        {currentView === 'requests-create' && (
          <CreateRequestView
            onBack={() => navigateTo(getDashboardForRole(currentUser.role))}
            onSuccess={(newReq) => {
              setDetailRequest(newReq);
              navigateTo('requester-dashboard');
            }}
          />
        )}

        {/* View 5: Donor Dashboard (Role-Protected) */}
        {currentView === 'donor-dashboard' && (
          currentUser.role === 'DONOR' ? (
            <DonorDashboard
              onViewDetail={(req) => setDetailRequest(req)}
              onCommit={(req) => setCommitmentRequest(req)}
              onOpenDonorCard={() => setIsDonorCardModalOpen(true)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenBooking={() => {
                setReschedulingBooking(null);
                setIsBookingModalOpen(true);
              }}
              onRescheduleBooking={(booking) => {
                setReschedulingBooking(booking);
                setIsBookingModalOpen(true);
              }}
              onOpenChat={() => setIsChatModalOpen(true)}
            />
          ) : (
            <RoleAccessGuard
              currentRole={currentUser.role}
              requiredRole="DONOR"
              onRedirectToOwnDashboard={() => navigateTo(getDashboardForRole(currentUser.role))}
              onSwitchRole={(role) => {
                switchRole(role);
                navigateTo('donor-dashboard');
              }}
            />
          )
        )}

        {/* View 6: Requester Dashboard (Role-Protected) */}
        {currentView === 'requester-dashboard' && (
          currentUser.role === 'REQUESTER' ? (
            <RequesterDashboard
              onCreateRequest={() => navigateTo('requests-create')}
              onViewDetail={(req) => setDetailRequest(req)}
              onOpenReportAbuse={(req) => setReportRequest(req)}
              onSwitchToDonor={() => {
                switchRole('DONOR');
                navigateTo('donor-dashboard');
              }}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onOpenChat={() => setIsChatModalOpen(true)}
              onManageCompanions={(req) => setCompanionRequest(req)}
            />
          ) : (
            <RoleAccessGuard
              currentRole={currentUser.role}
              requiredRole="REQUESTER"
              onRedirectToOwnDashboard={() => navigateTo(getDashboardForRole(currentUser.role))}
              onSwitchRole={(role) => {
                switchRole(role);
                navigateTo('requester-dashboard');
              }}
            />
          )
        )}

        {/* View 7: Hospital Dashboard (Role-Protected) */}
        {currentView === 'hospital-dashboard' && (
          currentUser.role === 'HOSPITAL' ? (
            <HospitalDashboard
              onViewDetail={(req) => setDetailRequest(req)}
              onCreateRequest={() => navigateTo('requests-create')}
              onOpenBagReceipt={(req) => setBagReceiptRequest(req)}
            />
          ) : (
            <RoleAccessGuard
              currentRole={currentUser.role}
              requiredRole="HOSPITAL"
              onRedirectToOwnDashboard={() => navigateTo(getDashboardForRole(currentUser.role))}
              onSwitchRole={(role) => {
                switchRole(role);
                navigateTo('hospital-dashboard');
              }}
            />
          )
        )}

        {/* View 8: PMI Dashboard (Role-Protected) */}
        {currentView === 'pmi-dashboard' && (
          currentUser.role === 'UTD_PMI' ? (
            <PmiDashboard
              onViewDetail={(req) => setDetailRequest(req)}
            />
          ) : (
            <RoleAccessGuard
              currentRole={currentUser.role}
              requiredRole="UTD_PMI"
              onRedirectToOwnDashboard={() => navigateTo(getDashboardForRole(currentUser.role))}
              onSwitchRole={(role) => {
                switchRole(role);
                navigateTo('pmi-dashboard');
              }}
            />
          )
        )}

        {/* View 9: Admin Dashboard (Role-Protected) */}
        {currentView === 'admin-dashboard' && (
          currentUser.role === 'ADMIN' ? (
            <AdminDashboard />
          ) : (
            <RoleAccessGuard
              currentRole={currentUser.role}
              requiredRole="ADMIN"
              onRedirectToOwnDashboard={() => navigateTo(getDashboardForRole(currentUser.role))}
              onSwitchRole={(role) => {
                switchRole(role);
                navigateTo('admin-dashboard');
              }}
            />
          )
        )}
      </main>

      {/* Universal Modals */}
      <RequestDetailModal
        request={detailRequest}
        isOpen={Boolean(detailRequest)}
        onClose={() => setDetailRequest(null)}
        onOpenCommitment={(req) => {
          setDetailRequest(null);
          setCommitmentRequest(req);
        }}
        onOpenReportAbuse={(req) => {
          setDetailRequest(null);
          setReportRequest(req);
        }}
        onOpenChat={() => {
          setIsChatModalOpen(true);
        }}
        onOpenBagReceipt={(req) => {
          setBagReceiptRequest(req);
        }}
      />

      <DonorCommitmentModal
        request={commitmentRequest}
        isOpen={Boolean(commitmentRequest)}
        onClose={() => setCommitmentRequest(null)}
      />

      <ReportAbuseModal
        request={reportRequest}
        isOpen={Boolean(reportRequest)}
        onClose={() => setReportRequest(null)}
      />

      <MedicalDisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
      />

      <DigitalDonorCardModal
        isOpen={isDonorCardModalOpen}
        onClose={() => setIsDonorCardModalOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenDonorCard={() => setIsDonorCardModalOpen(true)}
      />

      {/* New Upgraded Modals */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />

      <VoluntaryBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setReschedulingBooking(null);
        }}
        reschedulingBooking={reschedulingBooking}
      />

      <FamilyCompanionModal
        request={companionRequest}
        isOpen={Boolean(companionRequest)}
        onClose={() => setCompanionRequest(null)}
      />

      <BagReceiptModal
        request={bagReceiptRequest}
        isOpen={Boolean(bagReceiptRequest)}
        onClose={() => setBagReceiptRequest(null)}
      />

      <BloodEducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        onOpenBooking={() => {
          setIsEducationModalOpen(false);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Floating Interactive Assistant */}
      <DonorLinkAssistant />

      {/* Floating Toast Container */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
            <BrandLogo variant="horizontal" imgClassName="h-8" />
            <span aria-hidden="true" className="hidden sm:inline text-slate-300">·</span>
            <span className="text-slate-600 font-medium">Platform Pendataan & Koordinasi Kebutuhan Darah Sukarela Cirebon</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <button
              onClick={() => setIsEducationModalOpen(true)}
              className="hover:text-rose-700 font-semibold cursor-pointer text-slate-700"
            >
              Pusat Edukasi Donor
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsDisclaimerModalOpen(true)}
              className="hover:text-slate-800 underline cursor-pointer"
            >
              Batasan Hukum & Medis
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-semibold text-slate-700">Kota & Kabupaten Cirebon</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
