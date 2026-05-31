'use client';

import type { ArbitrageConfig } from '@/types/bot';
import Tooltip from '@/components/Tooltip';

interface ArbitrageFormProps {
  config: ArbitrageConfig;
  onChange: (config: ArbitrageConfig) => void;
}

const EXCHANGES = ['jupiter', 'raydium', 'orca'];

export default function ArbitrageForm({ config, onChange }: ArbitrageFormProps) {
  const toggleExchange = (ex: string) => {
    const newEx = config.exchanges.includes(ex)
      ? config.exchanges.filter((e) => e !== ex)
      : [...config.exchanges, ex];
    if (newEx.length === 0) return; // must keep at least one
    onChange({ ...config, exchanges: newEx });
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Trading Pair */}
      <div className="space-y-2">
        <div className="flex items-center">
          <label htmlFor="trading-pair" className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            Trading Pair
          </label>
          <Tooltip text="The two tokens your bot will trade between. It buys one with the other, then sells it back to capture any price difference." />
        </div>
        <select
          id="trading-pair"
          value={config.tradingPair}
          onChange={(e) => onChange({ ...config, tradingPair: e.target.value })}
        >
          <option value="SOL/USDC">SOL / USDC</option>
          <option value="ETH/USDC">ETH / USDC</option>
          <option value="BTC/USDC">BTC / USDC</option>
        </select>
      </div>

      {/* Target Venues */}
      <div className="space-y-2">
        <div className="flex items-center">
          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            Target Venues
          </label>
          <Tooltip text="Decentralized exchanges the bot scans for price differences. More venues = more chances to find profitable trades." />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {EXCHANGES.map((ex) => {
            const active = config.exchanges.includes(ex);
            return (
              <label
                key={ex}
                className={`flex items-center gap-2 p-3 border cursor-pointer transition-colors ${
                  active ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-700 hover:border-zinc-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleExchange(ex)}
                />
                <span className={`text-xs uppercase ${active ? 'text-orange-500 font-bold' : 'text-zinc-400'}`}>
                  {ex}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Profit Threshold */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Minimum Profit
            </label>
            <Tooltip text="The smallest profit (in USD) the bot will act on. Trades below this threshold are skipped because fees would eat into the gain." />
          </div>
          <span className="text-xs font-bold text-zinc-50">${config.minProfitUsdc.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="50"
          step="0.5"
          value={config.minProfitUsdc}
          onChange={(e) => onChange({ ...config, minProfitUsdc: Number(e.target.value) })}
        />
        <p className="text-[9px] text-zinc-600 mt-1">
          Lower values catch more opportunities but risk losing money to fees.
        </p>
      </div>

      {/* Trade Size */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              Max Trade Size
            </label>
            <Tooltip text="Maximum SOL the bot risks per trade. Larger trades earn more but face higher price impact — your trade itself moves the market price." />
          </div>
          <span className="text-xs font-bold text-zinc-50">{config.maxTradeSizeSol.toFixed(1)} SOL</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="100"
          step="0.1"
          value={config.maxTradeSizeSol}
          onChange={(e) => onChange({ ...config, maxTradeSizeSol: Number(e.target.value) })}
        />
        <p className="text-[9px] text-zinc-600 mt-1">
          Start with small amounts. Large trades face significant price impact.
        </p>
      </div>

      {/* Execution Speed */}
      <div className="space-y-3 pt-6 brutal-border-t">
        <div className="flex items-center">
          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            Execution Method
          </label>
          <Tooltip text="Standard RPC is free but visible to other bots. Jito bundles are private and prioritized, but cost a small tip per trade." />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...config, executionSpeed: 'standard' })}
            className={`p-3 border text-left cursor-pointer transition-colors ${
              config.executionSpeed === 'standard'
                ? 'border-zinc-50 bg-zinc-900'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
            }`}
          >
            <div className={`text-xs font-bold uppercase mb-1 ${config.executionSpeed === 'standard' ? 'text-zinc-50' : 'text-zinc-500'}`}>
              Standard RPC
            </div>
            <div className="text-[9px] text-zinc-500">
              Free, but visible to other bots
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...config, executionSpeed: 'jito' })}
            className={`p-3 border text-left cursor-pointer transition-colors ${
              config.executionSpeed === 'jito'
                ? 'border-orange-500 bg-orange-500/10'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
            }`}
          >
            <div className={`text-xs font-bold uppercase mb-1 ${config.executionSpeed === 'jito' ? 'text-orange-500' : 'text-zinc-500'}`}>
              Jito Bundle
            </div>
            <div className="text-[9px] text-zinc-500">
              Private, priority inclusion
            </div>
          </button>
        </div>
      </div>

      {config.executionSpeed === 'jito' && (
        <div className="space-y-2 pl-4 border-l-2 border-orange-500 bg-orange-500/5 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <label className="block text-[10px] text-orange-500 uppercase tracking-widest font-bold">
                Jito Tip
              </label>
              <Tooltip text="SOL paid to the block validator for priority inclusion. Higher tip = faster execution. Typical range: 0.001 - 0.05 SOL." />
            </div>
            <span className="text-xs font-bold text-orange-500">{config.jitoTipSol.toFixed(3)} SOL</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.1"
            step="0.001"
            value={config.jitoTipSol}
            onChange={(e) => onChange({ ...config, jitoTipSol: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  );
}
