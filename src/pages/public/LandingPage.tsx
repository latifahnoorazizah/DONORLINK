import React from 'react';
import { 
  HeartHandshake, 
  Search, 
  ShieldCheck, 
  Building2, 
  PhoneCall, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Syringe,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BloodRequest } from '../../types';
import { BrandLogo } from '../../components/common/BrandLogo';

interface LandingPageProps {
  onNavigate: (view: string) => void;
  onOpenDisclaimer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenDisclaimer }) => {
  const { requests, facilities, allUsers, switchRole } = useApp();

  const activeRequests = requests.filter(r => r.status === 'OPEN' || r.status === 'PARTIALLY_FULFILLED');
  const criticalCount = activeRequests.filter(r => r.urgency === 'CRITICAL_24H').length;

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative pt-4 sm:pt-8 pb-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center mb-2">
          <BrandLogo variant="full" imgClassName="h-28 sm:h-36 md:h-40" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-semibold">
          <HeartHandshake className="w-3.5 h-3.5 text-rose-700" />
          <span>Platform Koordinasi Donor Darah Sukarela Wilayah Kota & Kab. Cirebon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
          Menghubungkan <span className="text-rose-700">Kebutuhan Darah Pasien</span> dengan Pendonor Sukarela Terdekat
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Mengurangi pesan berantai yang kedaluwarsa dan mencegah penipuan calo darah. Setiap permohonan diverifikasi bersama Rumah Sakit dan UTD PMI.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('matching-browser')}
            className="w-full sm:w-auto px-6 py-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Lihat Kebutuhan Darah Darurat</span>
          </button>

          <button
            onClick={() => {
              switchRole('DONOR');
              onNavigate('donor-dashboard');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-rose-700" />
            <span>Masuk Sebagai Pendonor</span>
          </button>
        </div>

        {/* Aggregate Stats strip */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Permohonan Aktif</span>
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
              {activeRequests.length} Pasien
            </span>
            <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
              {criticalCount} Kritis (&lt; 24 Jam)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Pendonor Sukarela</span>
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
              340+ Relawan
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
              Siap On-Call
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Fasilitas RS & PMI</span>
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900 mt-0.5 block">
              {facilities.length} Institusi
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Kota & Kab. Cirebon
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium block">Prinsip Donasi</span>
            <span className="text-2xl font-black font-mono text-emerald-800 mt-0.5 block">
              100% Gratis
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Bebas Calo / Jual Beli
            </span>
          </div>
        </div>
      </section>

      {/* 3-Step Coordination Flow */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs max-w-5xl mx-auto space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bagaimana DONORLINK Bekerja?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Alur koordinasi terstruktur untuk mempercepat pencarian pendonor tanpa kepanikan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Pengajuan Kebutuhan Terverifikasi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Keluarga pasien menginput golongan darah, komponen (PRC/WB/TC), dan rumah sakit rujukan dengan melampirkan formulir transfusi resmi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Pencocokan Cerdas & Notifikasi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem memfilter pendonor yang memiliki golongan darah identik, berdomisili di kota yang sama, dan telah melewati masa tunggu 60 hari.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Skrining & Transfusi di Faskes
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Relawan hadir di Bank Darah RS atau UTD PMI untuk menjalani pemeriksaan fisik langsung oleh petugas medis hingga proses pengambilan darah.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Directory Directory */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-rose-700" />
              Kontak Resmi Unit Transfusi Darah (UTD) & BDRS
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hubungi langsung nomor resmi fasilitas kesehatan berikut untuk koordinasi darurat rujukan darah.
            </p>
          </div>
          <button
            onClick={onOpenDisclaimer}
            className="text-xs font-semibold text-rose-700 hover:text-rose-800 underline cursor-pointer self-start sm:self-auto"
          >
            Baca Batasan Klinis Platform
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(fac => (
            <div 
              key={fac.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-colors shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-900 text-sm leading-snug">{fac.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {fac.type === 'UTD_PMI' ? 'PMI' : 'RS'}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{fac.city} · {fac.address}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-slate-700 font-semibold">{fac.phone}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                  {fac.operationHours}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
