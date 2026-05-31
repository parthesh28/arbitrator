'use client';

import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
}

export default function Tooltip({ text }: TooltipProps) {
  return (
    <span className="group relative inline-flex ml-1 align-middle">
      <button
        type="button"
        aria-label="More info"
        className="w-4 h-4 rounded-full bg-zinc-700/60 flex items-center justify-center cursor-help group-hover:bg-zinc-600/80 transition-colors"
      >
        <Info className="w-2.5 h-2.5 text-zinc-400" />
      </button>
      <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-[11px] leading-relaxed text-zinc-300 shadow-xl z-50">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-700" />
      </span>
    </span>
  );
}
