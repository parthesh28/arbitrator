'use client';

import { useState, useCallback } from 'react';
import type { ArbitrageConfig, DryRunResult, ExportPayload } from '@/types/bot';
import Tooltip from './Tooltip';

interface DryRunPanelProps {
  arbConfig: ArbitrageConfig;
  onActiveNode: (node: number) => void;
}

export default function DryRunPanel({ arbConfig, onActiveNode }: DryRunPanelProps) {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<DryRunResult | null>(null);

  const runSimulation = useCallback(async () => {
    setStatus('running');
    setResult(null);
    onActiveNode(0);
    
    try {
      const payload: ExportPayload = { config: arbConfig };
      
      const res = await fetch('/api/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Simulation failed (${res.status})`);
      }

      const data = await res.json() as DryRunResult;
      
      onActiveNode(1);
      await new Promise(r => setTimeout(r, 800));
      onActiveNode(2);
      await new Promise(r => setTimeout(r, 800));
      onActiveNode(3);

      setResult(data);
      setStatus(data.success ? 'done' : 'error');
      
    } catch (err) {
      setResult({
        success: false,
        timestamp: Date.now(),
        message: err instanceof Error ? err.message : 'Unknown error during simulation',
      });
      setStatus('error');
    } finally {
      setTimeout(() => onActiveNode(-1), 1000);
    }
  }, [arbConfig, onActiveNode]);

  return (
    <div className="brutal-border bg-zinc-950 flex flex-col">
      <div className="px-4 py-2.5 brutal-border-b bg-zinc-900/80 flex justify-between items-center">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
          Simulation
        </span>
        <button
          type="button"
          onClick={runSimulation}
          disabled={status === 'running'}
          className="brutal-btn-primary px-3 py-1 text-[9px] font-mono cursor-pointer disabled:opacity-50"
        >
          {status === 'running' ? 'Running...' : 'Run Dry Test'}
        </button>
      </div>

      <div className="p-4 bg-zinc-950 min-h-[140px] flex flex-col">
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
            <p className="text-[11px] font-mono text-zinc-600 text-center">
              Click &ldquo;Run Dry Test&rdquo; to simulate a round-trip trade using live Jupiter quotes.
            </p>
            <p className="text-[10px] font-mono text-zinc-700 text-center max-w-xs">
              No funds are spent. This fetches real-time prices to estimate what the bot would see.
            </p>
          </div>
        )}

        {status === 'running' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
            <div className="text-[11px] font-mono text-orange-500 animate-pulse">
              Fetching live quotes from Jupiter...
            </div>
            <div className="w-48 h-0.5 bg-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-orange-500 w-1/3 animate-[brutal-marquee_1s_linear_infinite]" />
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fade-in flex flex-col gap-4">
            {/* Status banner */}
            <div className={`p-3 border text-[11px] font-mono leading-relaxed ${
              result.success 
                ? (result.estimatedProfit ?? 0) > 0 
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                  : 'border-orange-500/30 bg-orange-500/5 text-orange-400'
                : 'border-red-500/30 bg-red-500/5 text-red-400'
            }`}>
              {result.message}
            </div>

            {/* Metrics grid */}
            {result.success && result.estimatedProfit !== undefined && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1 group relative">
                    Gross Spread
                    <Tooltip text="The raw price difference from the round-trip before any fees are deducted." />
                  </div>
                  <div className="text-lg font-bold font-mono text-zinc-50">
                    ${(result.roundTripReturn! - result.inputAmount!) * result.currentPrice! > 0 
                      ? ((result.roundTripReturn! - result.inputAmount!) * result.currentPrice!).toFixed(4)
                      : '0.0000'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
                    Net Profit
                    <Tooltip text="Final profit after subtracting Solana TX fees and Jito tip (if enabled)." />
                  </div>
                  <div className={`text-lg font-bold font-mono ${result.estimatedProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${result.estimatedProfit.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
                    Price Impact
                    <Tooltip text="How much your trade moves the market price against you. Larger trades have higher impact." />
                  </div>
                  <div className="text-sm font-mono text-zinc-300">
                    {(result.priceImpact ?? 0).toFixed(4)}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center gap-1">
                    Gas + Fees
                    <Tooltip text="Solana base TX fee (~0.00001 SOL) plus Jito validator tip if enabled. Converted to USD at current price." />
                  </div>
                  <div className="text-sm font-mono text-zinc-300">
                    ${(result.gasAndFeesUsdc ?? 0).toFixed(4)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
