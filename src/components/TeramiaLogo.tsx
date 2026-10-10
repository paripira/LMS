import React from 'react';

export function TeramiaEmblem({ className = 'h-16 w-auto' }: { className?: string }) {
  return (
    <img
      src="/images/logo.png"
      alt="Logo Sekolah Teramia"
      className={`${className} object-contain`}
    />
  );
}

export default function TeramiaLogo({
  size = 'md',
  showSubtitle = true,
  lightText = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  lightText?: boolean;
}) {
  const emblemSizes = {
    sm: 'h-9 w-auto',
    md: 'h-11 w-auto',
    lg: 'h-16 w-auto',
  };

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <TeramiaEmblem className={`${emblemSizes[size]} shrink-0 drop-shadow-xs`} />
      <div className="leading-tight">
        <div
          className={`font-extrabold tracking-tight ${
            size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm'
          } ${lightText ? 'text-white' : 'text-[#162d6e]'}`}
        >
          Sekolah Teramia
        </div>
        {showSubtitle && (
          <div
            className={`font-semibold tracking-widest uppercase ${
              size === 'lg' ? 'text-xs' : 'text-[10px]'
            } ${lightText ? 'text-[#f5b800]' : 'text-slate-500'}`}
          >
            TK · SD · SMP
          </div>
        )}
      </div>
    </div>
  );
}
