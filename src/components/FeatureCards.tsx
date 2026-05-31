'use client';

const FEATURES = [
  {
    step: '01',
    title: 'Configure',
    description: 'Set trading pair, venue selection, profit thresholds, and execution method. Every option is explained in plain English.',
  },
  {
    step: '02',
    title: 'Analyze',
    description: 'Review compute costs, API usage, and per-trade fee breakdowns. Warnings flag potential issues before you deploy.',
  },
  {
    step: '03',
    title: 'Simulate',
    description: 'Dry-run your strategy against live Solana prices via the Jupiter API. See real spread, impact, and fee numbers.',
  },
  {
    step: '04',
    title: 'Export',
    description: 'Download a standalone TypeScript project with all dependencies. Run it on your machine with a single command.',
  },
];

export default function FeatureCards() {
  return (
    <section className="py-20 px-6 bg-zinc-950 border-b border-zinc-800" id="features">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h2 className="text-sm font-bold font-mono text-orange-500 mb-2">
            How it works
          </h2>
          <p className="text-2xl font-bold tracking-tight text-zinc-50 max-w-md">
            Four steps from configuration to execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800 border border-zinc-800">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-950 p-6 flex flex-col group hover:bg-zinc-900/50 transition-colors"
            >
              <span className="font-mono text-[11px] text-zinc-600 mb-4">
                {f.step}
              </span>
              <h3 className="text-sm font-bold font-mono text-zinc-50 mb-3 tracking-tight">
                {f.title}
              </h3>
              <p className="font-mono text-[11px] text-zinc-500 leading-relaxed mt-auto">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
