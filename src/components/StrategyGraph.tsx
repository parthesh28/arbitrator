'use client';

interface StrategyGraphProps {
  activeNode: number;
}

export default function StrategyGraph({ activeNode }: StrategyGraphProps) {
  const nodes = [
    { id: 0, label: 'Fetch Quotes', desc: 'Jupiter API' },
    { id: 1, label: 'Evaluate', desc: 'Calculate profit' },
    { id: 2, label: 'Build TX', desc: 'Compose swaps' },
    { id: 3, label: 'Execute', desc: 'Send to network' },
  ];

  return (
    <div className="border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
          Execution Pipeline
        </span>
      </div>

      <div className="flex items-center gap-0">
        {nodes.map((node, i) => {
          const isActive = activeNode === i;
          const isPast = activeNode > i;

          return (
            <div key={node.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 flex items-center justify-center font-mono text-[9px] font-bold border transition-colors ${
                    isActive
                      ? 'border-orange-500 bg-orange-500 text-black'
                      : isPast
                        ? 'border-zinc-500 text-zinc-500'
                        : 'border-zinc-800 text-zinc-700'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-[9px] font-mono mt-1.5 text-center leading-tight ${
                  isActive ? 'text-zinc-200' : 'text-zinc-600'
                }`}>
                  {node.label}
                </span>
              </div>
              {i < nodes.length - 1 && (
                <div className={`h-px flex-shrink-0 w-4 ${
                  activeNode > i ? 'bg-orange-500' : 'bg-zinc-800'
                } transition-colors`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
