import React from 'react';

export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div className={`${sizes[size]} border-emerald-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
};
