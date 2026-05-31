export interface ArbitrageConfig {
  tradingPair: string;
  exchanges: string[];
  minProfitUsdc: number;
  maxTradeSizeSol: number;
  executionSpeed: 'standard' | 'jito';
  jitoTipSol: number;
}

export interface ExportPayload {
  config: ArbitrageConfig;
}

// ─── Analysis Engine Types ───

export interface AnalysisWarning {
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export interface AnalysisResult {
  cuEstimate: number;
  rpcLoadPerMin: number;
  profitability: {
    gross: number;
    netAfterFees: number;
    roi: string;
  };
  capitalRequired: number;
  warnings: AnalysisWarning[];
}

export interface DryRunResult {
  success: boolean;
  timestamp: number;
  pair?: string;
  inputAmount?: number;
  outputAmount?: number;
  roundTripReturn?: number;
  estimatedProfit?: number;
  currentPrice?: number;
  priceImpact?: number;
  gasAndFeesUsdc?: number;
  message: string;
}
