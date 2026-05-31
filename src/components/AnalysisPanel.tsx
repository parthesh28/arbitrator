'use client';

import { useMemo } from 'react';
import type { ArbitrageConfig } from '@/types/bot';

interface AnalysisPanelProps {
  arbConfig: ArbitrageConfig;
}

export default function AnalysisPanel({ arbConfig }: AnalysisPanelProps) {
  const analysis = useMemo(() => {
    // CU calculation based on actual Solana transaction composition:
    // - Base TX overhead: ~5,000 CU
    // - Create WSOL ATA (CreateAssociatedTokenAccount): ~30,000 CU
    // - SyncNative instruction: ~3,000 CU  
    // - Each Jupiter swap (single route): ~80,000-120,000 CU depending on DEX
    // - CloseAccount: ~3,000 CU
    // - Jito tip transfer: ~3,000 CU
    // We have 2 swap legs, so ~200,000-280,000 CU for the base case
    // More venues can lead to multi-hop routes (2-3 intermediate swaps) which cost more
    
    let baseCu = 44_000; // ATA creation + sync + close + base overhead
    const cuPerSwapLeg = 80_000 + (arbConfig.exchanges.length * 15_000); // more venues = more complex routing
    baseCu += cuPerSwapLeg * 2; // two swap legs
    if (arbConfig.executionSpeed === 'jito') {
      baseCu += 3_000; // tip transfer instruction
    }

    // RPC calls: the bot polls at POLL_INTERVAL_MS = 3000ms
    // Each poll = 2 quote requests (buy + sell), so 40 calls/min
    const rpcCallsPerMin = Math.round((60_000 / 3000) * 2);

    // Fee estimate in SOL
    const baseTxFee = 0.00001; // 5000 lamports
    const cuPrice = baseCu > 200_000 ? 0.000005 : 0.000001; // priority fee estimate
    const jitoTip = arbConfig.executionSpeed === 'jito' ? arbConfig.jitoTipSol : 0;
    const totalFeeSol = baseTxFee + cuPrice + jitoTip;
    
    return {
      cuEstimate: baseCu,
      cuMax: 1_400_000,
      rpcCallsPerMin,
      totalFeeSol,
      capitalRequired: arbConfig.maxTradeSizeSol,
      warnings: [
        ...(arbConfig.executionSpeed === 'standard' 
          ? [{ severity: 'warning' as const, text: 'Standard RPC transactions are visible in the mempool. Other bots can front-run your trades. Consider Jito for MEV protection.' }] 
          : []),
        ...(arbConfig.maxTradeSizeSol > 20
          ? [{ severity: 'warning' as const, text: `Trading ${arbConfig.maxTradeSizeSol} SOL per trade will cause significant price impact. Consider reducing to < 10 SOL.` }]
          : []),
        ...(arbConfig.minProfitUsdc < 1
          ? [{ severity: 'warning' as const, text: 'Very low profit threshold. Most opportunities below $1 will be eaten by fees and slippage.' }]
          : []),
        ...(arbConfig.executionSpeed === 'jito' && arbConfig.jitoTipSol > 0.05
          ? [{ severity: 'info' as const, text: `Jito tip of ${arbConfig.jitoTipSol} SOL is high. Typical tips are 0.001-0.01 SOL unless competing for high-value opportunities.` }]
          : []),
      ]
    };
  }, [arbConfig]);

  return (
    <div className="brutal-border bg-zinc-950 flex flex-col">
      <div className="px-4 py-2.5 brutal-border-b bg-zinc-900/80 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
          Static Analysis
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* Compute Units */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
              <span>Compute Units</span>
              <span className="cursor-help text-zinc-600 hover:text-zinc-400" title="Computational cost on Solana. Your transaction uses this many CU out of the 1.4M per-transaction limit. Higher CU = higher priority fees.">i</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-200">
              {analysis.cuEstimate.toLocaleString()} / {(analysis.cuMax / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="h-1.5 bg-zinc-900 border border-zinc-800 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-orange-500/70 transition-all duration-300"
              style={{ width: `${(analysis.cuEstimate / analysis.cuMax) * 100}%` }}
            />
          </div>
        </div>

        {/* RPC Load */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
              <span>API Calls / min</span>
              <span className="cursor-help text-zinc-600 hover:text-zinc-400" title="How often the bot queries Jupiter for prices. Each poll checks both legs. Free tier: 30/min. With API key: 600/min.">i</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-200">{analysis.rpcCallsPerMin}</span>
          </div>
          <div className="h-1.5 bg-zinc-900 border border-zinc-800 relative">
            <div 
              className="absolute top-0 left-0 h-full transition-all duration-300"
              style={{ 
                width: `${Math.min((analysis.rpcCallsPerMin / 600) * 100, 100)}%`,
                backgroundColor: analysis.rpcCallsPerMin > 30 ? '#f97316' : '#a1a1aa'
              }}
            />
          </div>
          {analysis.rpcCallsPerMin > 30 && (
            <p className="text-[9px] font-mono text-orange-500/70 mt-1">
              Exceeds free tier (30/min). A Jupiter API key is required.
            </p>
          )}
        </div>

        {/* Fee breakdown */}
        <div className="brutal-border-t pt-4">
          <div className="text-[10px] font-mono text-zinc-500 mb-3">Per-trade fee breakdown</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-zinc-500">Base TX fee</span>
              <span className="text-zinc-300">0.00001 SOL</span>
            </div>
            {arbConfig.executionSpeed === 'jito' && (
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-500">Jito tip</span>
                <span className="text-orange-400">{arbConfig.jitoTipSol} SOL</span>
              </div>
            )}
            <div className="flex justify-between text-[10px] font-mono brutal-border-t pt-1.5">
              <span className="text-zinc-400 font-bold">Total per trade</span>
              <span className="text-zinc-200 font-bold">{analysis.totalFeeSol.toFixed(6)} SOL</span>
            </div>
          </div>
        </div>

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="brutal-border-t pt-4 space-y-2">
            <div className="text-[10px] font-mono text-zinc-500 mb-2">Warnings</div>
            {analysis.warnings.map((w, i) => (
              <div key={i} className={`text-[10px] font-mono leading-relaxed p-2.5 border ${
                w.severity === 'info' ? 'border-zinc-800 text-zinc-400' : 
                'border-orange-500/30 text-orange-400 bg-orange-500/5'
              }`}>
                {w.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
