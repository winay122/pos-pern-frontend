import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-700 active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
