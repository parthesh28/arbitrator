'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeatureCards from '@/components/FeatureCards';
import Walkthrough from '@/components/Walkthrough';
import Footer from '@/components/Footer';
import ArbitrageForm from '@/components/ArbitrageForm';
import CodePreview from '@/components/CodePreview';
import StrategyGraph from '@/components/StrategyGraph';
import AnalysisPanel from '@/components/AnalysisPanel';
import DryRunPanel from '@/components/DryRunPanel';
import type { ArbitrageConfig, ExportPayload } from '@/types/bot';

const DEFAULT_ARB: ArbitrageConfig = {
  tradingPair: 'SOL/USDC', exchanges: ['jupiter'], minProfitUsdc: 5.0,
  maxTradeSizeSol: 5.0, executionSpeed: 'standard', jitoTipSol: 0.01,
};

type PreviewTab = 'code' | 'graph' | 'analysis';

export default function Home() {
  const [screen, setScreen] = useState<'landing' | 'builder'>('landing');
  const [step, setStep] = useState(0);
  const [arbConfig, setArbConfig] = useState<ArbitrageConfig>(DEFAULT_ARB);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('code');
  const [activeGraphNode, setActiveGraphNode] = useState(-1);

  const handleStartBuilder = useCallback(() => {
    setScreen('builder');
    setStep(0);
  }, []);

  const handleReset = useCallback(() => {
    setScreen('landing');
    setStep(0);
    setExportError(null);
    setPreviewTab('code');
    setActiveGraphNode(-1);
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportError(null);
    const payload: ExportPayload = { config: arbConfig };
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arbitrator-bot.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  }, [arbConfig]);

  // ─── Landing ───
  if (screen === 'landing') {
    return (
      <div className="min-h-screen brutal-grid flex flex-col">
        <Header />
        <HeroSection onStart={handleStartBuilder} />
        <Walkthrough />
        <FeatureCards />
        <Footer />
      </div>
    );
  }

  // ─── Builder ───
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <Header showReset onReset={handleReset} />

      {/* Minimal step indicator */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex items-center h-10">
          <button
            type="button"
            onClick={() => setStep(0)}
            className={`text-[11px] font-mono transition-colors cursor-pointer ${
              step === 0 ? 'text-zinc-50 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Configure
          </button>
          <span className="text-zinc-700 mx-3 text-[10px] font-mono">/</span>
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`text-[11px] font-mono transition-colors cursor-pointer ${
              step === 1 ? 'text-zinc-50 font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Review & Export
          </button>
        </div>
      </div>

      <main className="flex-1">
        {/* Step 0: Configure */}
        {step === 0 && (
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Left: Form — 2/5 width */}
              <div className="lg:col-span-2 border-r border-zinc-800">
                <div className="p-6 lg:p-8">
                  <div className="mb-6 pb-4 border-b border-zinc-800">
                    <h2 className="text-sm font-bold font-mono text-zinc-50 tracking-tight">
                      Strategy Configuration
                    </h2>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">
                      Set your trading parameters
                    </p>
                  </div>

                  <ArbitrageForm config={arbConfig} onChange={setArbConfig} />

                  <div className="flex items-center justify-end mt-10 pt-6 border-t border-zinc-800">
                    <button type="button" onClick={() => setStep(1)}
                      className="brutal-btn-primary px-5 py-2.5 text-[11px] font-mono cursor-pointer">
                      Review & Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Preview panels — 3/5 width */}
              <div className="lg:col-span-3">
                <div className="p-6 lg:p-8 space-y-5">
                  {/* Tab bar */}
                  <div className="flex items-center gap-0 border border-zinc-800">
                    {([
                      { key: 'code' as const, label: 'Code' },
                      { key: 'graph' as const, label: 'Data Flow' },
                      { key: 'analysis' as const, label: 'Analysis' },
                    ]).map(({ key, label }, idx) => (
                      <button key={key} type="button" onClick={() => setPreviewTab(key)}
                        className={`flex-1 py-2.5 text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                          idx > 0 ? 'border-l border-zinc-800' : ''
                        } ${
                          previewTab === key
                            ? 'bg-orange-500 text-black'
                            : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {previewTab === 'code' && (
                    <div className="animate-fade-in">
                      <CodePreview arbConfig={arbConfig} />
                    </div>
                  )}

                  {previewTab === 'graph' && (
                    <div className="space-y-5 animate-fade-in">
                      <StrategyGraph activeNode={activeGraphNode} />
                      <DryRunPanel
                        arbConfig={arbConfig}
                        onActiveNode={setActiveGraphNode}
                      />
                    </div>
                  )}

                  {previewTab === 'analysis' && (
                    <div className="animate-fade-in">
                      <AnalysisPanel arbConfig={arbConfig} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Review & Export */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-base font-bold font-mono text-zinc-50 tracking-tight">
                Review & Export
              </h2>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">
                Verify your configuration, then download the project.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                {/* Config summary */}
                <div className="border border-zinc-800 bg-zinc-950">
                  <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                    <h3 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
                      Configuration
                    </h3>
                  </div>
                  <div className="p-4">
                    {[
                      ['Pair', arbConfig.tradingPair],
                      ['Venues', arbConfig.exchanges.join(', ').toUpperCase()],
                      ['Min Profit', '$' + arbConfig.minProfitUsdc.toFixed(2)],
                      ['Max Size', arbConfig.maxTradeSizeSol.toFixed(1) + ' SOL'],
                      ['Routing', arbConfig.executionSpeed === 'jito' ? 'Jito Bundle' : 'Standard RPC'],
                      ...(arbConfig.executionSpeed === 'jito' ? [['Jito Tip', arbConfig.jitoTipSol + ' SOL']] : []),
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between py-1.5 border-b border-zinc-800/40 last:border-b-0">
                        <span className="text-[10px] text-zinc-500 font-mono">{k}</span>
                        <span className="text-[10px] font-bold text-zinc-200 font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output files */}
                <div className="border border-zinc-800 bg-zinc-950">
                  <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
                    <h3 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
                      Output Files
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {['package.json', '.env.example', 'src/config.ts', 'src/utils.ts', 'src/monitor.ts', 'src/math.ts', 'src/executor.ts', 'src/index.ts', 'README.md', 'tsconfig.json'].map((f) => (
                        <div key={f} className="flex items-center gap-1.5 py-0.5">
                          <span className="text-[9px] text-orange-500/50 font-mono w-5">{f.endsWith('.ts') ? 'TS' : f.endsWith('.json') ? 'JS' : 'MD'}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pipeline + dry run */}
                <StrategyGraph activeNode={activeGraphNode} />
                <DryRunPanel arbConfig={arbConfig} onActiveNode={setActiveGraphNode} />
              </div>

              {/* Right column — Analysis */}
              <div>
                <AnalysisPanel arbConfig={arbConfig} />
              </div>
            </div>

            {/* Export bar — fully separated */}
            {exportError && (
              <div className="mt-5 p-3 border border-red-500/30 bg-red-500/5 text-[11px] font-mono text-red-400">
                {exportError}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
              <button type="button" onClick={() => setStep(0)}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">
                Back to configuration
              </button>
              <button id="btn-export" type="button" onClick={handleExport} disabled={isExporting}
                className="brutal-btn-primary px-8 py-3 text-[11px] font-mono cursor-pointer">
                {isExporting ? 'Compiling...' : 'Download Bot'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
