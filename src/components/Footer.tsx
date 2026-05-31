'use client';

export default function Footer() {
  return (
    <footer className="brutal-border-t bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 flex items-center justify-center font-black text-black text-sm">
                A
              </div>
              <span className="text-sm font-bold font-mono text-zinc-50 uppercase tracking-tight">
                Arbitrator
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed max-w-xs">
              Open-source bot compiler for Solana. Configure strategies visually, download production-ready TypeScript code, run locally.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-500">
              <li>
                <a href="https://portal.jup.ag" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                  Jupiter Developer Portal
                </a>
              </li>
              <li>
                <a href="https://solana.com/docs" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                  Solana Documentation
                </a>
              </li>
              <li>
                <a href="https://www.jito.wtf" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                  Jito Labs
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4">
              Disclaimer
            </h4>
            <p className="text-[11px] font-mono text-zinc-600 leading-relaxed">
              This tool generates self-custodial bot code. Your private keys never leave your machine.
              Trading involves risk of financial loss. The generated code is provided as-is with no guarantees
              of profitability. Always test with small amounts first.
            </p>
          </div>
        </div>

        <div className="brutal-border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-mono text-zinc-600 tracking-widest">
            Self-custodial &middot; Open-source &middot; No telemetry
          </span>
        </div>
      </div>
    </footer>
  );
}
