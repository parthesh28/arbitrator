'use client';

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="relative flex flex-col pt-32 pb-24 px-6 bg-transparent overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <div>
          <p className="text-[11px] font-mono text-zinc-500 mb-6 tracking-wide">
            Configure. Simulate. Download. Run locally.
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-zinc-50 uppercase tracking-tighter leading-[0.9] mb-8">
            Arbitrator
          </h1>
          <p className="text-base text-zinc-400 max-w-xl font-mono leading-relaxed mb-10">
            A visual bot builder for Solana. Configure cross-DEX arbitrage
            strategies with precise parameters, simulate against live market
            data, and download a production-ready TypeScript project you run
            on your own machine.
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onStart}
              className="brutal-btn-primary px-8 py-3.5 text-sm font-mono cursor-pointer"
            >
              Start Building
            </button>
            <a
              href="#walkthrough"
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              Learn how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
