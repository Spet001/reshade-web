import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  align = 'left',
}) => {
  const alignClasses =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  return (
    <span className="relative inline-flex items-center gap-1 group cursor-help">
      <span className="border-b border-dotted border-[#64748B] group-hover:border-[#E05A3A] group-hover:text-[#F1F5F9] transition-colors duration-150">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-3.5 h-3.5 text-[9px] font-mono font-bold text-[#94A3B8] bg-[#0B0F17] border border-[#2A3242] group-hover:border-[#E05A3A] group-hover:text-[#FF9472] transition-colors duration-150 leading-none select-none shrink-0"
      >
        ?
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full mb-1.5 ${alignClasses} z-50 w-52 p-2 bg-[#0B0F17]/98 border border-[#3E495E] shadow-[0_8px_20px_rgba(0,0,0,0.85)] text-[10px] font-normal leading-relaxed text-[#E2E8F0] opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 transition-all duration-150`}
      >
        {content}
      </span>
    </span>
  );
};
