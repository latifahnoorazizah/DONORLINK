import React from 'react';

export const OFFICIAL_LOGO_SRC = '/assets/aistudio/Logo_DONORLINK_dengan_Motif_Mega_Mendung_b1c227e5.png';

interface BrandLogoProps {
  variant?: 'horizontal' | 'full' | 'icon' | 'badge';
  className?: string;
  imgClassName?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  className = '',
  imgClassName = '',
  showSubtitle = false,
  subtitleText = 'Kota & Kab. Cirebon',
  onClick
}) => {
  if (variant === 'full') {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center justify-center text-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <img 
          src={OFFICIAL_LOGO_SRC} 
          alt="DONORLINK — Menghubungkan Kebaikan, Menyelamatkan Kehidupan (Batik Mega Mendung Cirebon)"
          className={`w-auto h-20 sm:h-28 md:h-32 object-contain drop-shadow-xs transition-transform hover:scale-[1.02] ${imgClassName}`}
          loading="eager"
        />
        {showSubtitle && (
          <span className="text-[11px] font-semibold tracking-wider uppercase text-rose-800 bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 rounded-full mt-2">
            {subtitleText}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'icon' || variant === 'badge') {
    return (
      <div 
        onClick={onClick}
        className={`relative inline-flex items-center justify-center shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-rose-100 shadow-xs p-1 flex items-center justify-center overflow-hidden">
          <img 
            src={OFFICIAL_LOGO_SRC} 
            alt="DONORLINK Mega Mendung"
            className={`w-full h-full object-contain ${imgClassName}`}
            loading="eager"
          />
        </div>
      </div>
    );
  }

  // Default 'horizontal'
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <img 
        src={OFFICIAL_LOGO_SRC} 
        alt="DONORLINK — Menghubungkan Kebaikan, Menyelamatkan Kehidupan"
        className={`h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02] ${imgClassName}`}
        loading="eager"
      />
      {showSubtitle && (
        <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 border-l border-slate-200 pl-2">
          {subtitleText}
        </span>
      )}
    </div>
  );
};
