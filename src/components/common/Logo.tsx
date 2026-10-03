import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { img: 'w-7 h-7', title: 'text-sm', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9', title: 'text-base', sub: 'text-[10px]' },
    lg: { img: 'w-12 h-12', title: 'text-xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', title: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center space-x-2.5 select-none ${className}`}>
      <div className={`relative ${currentSize.img} rounded-xl overflow-hidden shadow-lg shadow-emerald-950/50 border border-emerald-500/40 bg-slate-900 flex-shrink-0 group-hover:scale-105 transition-transform`}>
        <img
          src="/logo.png"
          alt="ViRa POS Logo"
          className="w-full h-full object-cover"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-black tracking-tight text-slate-100 leading-tight ${currentSize.title}`}>
            ViRa <span className="text-emerald-400">POS</span>
          </span>
          <span className={`font-semibold text-emerald-400/90 tracking-wide uppercase ${currentSize.sub}`}>
            Smart Retail & Billing
          </span>
        </div>
      )}
    </div>
  );
};
