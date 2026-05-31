'use client';

import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  showReset?: boolean;
  onReset?: () => void;
}

export default function Header({ showReset, onReset }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          {/* Left: Logo */}
          <a
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={(e) => {
              if (showReset && onReset) {
                e.preventDefault();
                onReset();
              }
            }}
          >
            <div className="w-7 h-7 bg-orange-500 flex items-center justify-center font-black text-black text-xs tracking-tighter">
              A
            </div>
            <span className="text-[13px] font-mono font-bold text-zinc-50 tracking-tight group-hover:text-orange-500 transition-colors">
              arbitrator
            </span>
          </a>

          {/* Center: Nav links */}
          {!showReset && (
            <nav className="hidden md:flex items-center gap-8">
              <a href="#walkthrough" className="text-[11px] font-mono text-zinc-500 hover:text-zinc-100 transition-colors">
                How it works
              </a>
              <a href="#features" className="text-[11px] font-mono text-zinc-500 hover:text-zinc-100 transition-colors">
                Features
              </a>
            </nav>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            {showReset && onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to home
              </button>
            ) : (
              <a
                href="#walkthrough"
                className="brutal-btn-primary px-4 py-1.5 text-[10px] font-mono cursor-pointer"
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom border — thin accent line */}
      <div className="h-px bg-zinc-800" />
    </header>
  );
}
