import type { ArbitrageConfig, DryRunResult } from '@/types/bot';

const ALLOWED_PAIRS = ['SOL/USDC', 'ETH/USDC', 'BTC/USDC'];

const MINT_MAP: Record<string, string> = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  ETH: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
  BTC: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
};

const DECIMALS: Record<string, number> = { SOL: 9, USDC: 6, ETH: 8, BTC: 8 };

// Current Jupiter Swap API (V6 is sunset)
const JUPITER_API = 'https://api.jup.ag/swap/v1';

const TX_FEE_SOL = 0.00001;

async function fetchWithRetry(url: URL, maxRetries = 2): Promise<Record<string, unknown>> {
  for (let i = 0; i <= maxRetries; i++) {
    let res: Response;
    try {
      res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchErr) {
      if (i === maxRetries) throw new Error('Could not reach Jupiter API. Please try again.');
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
      continue;
    }

    if (res.ok) {
      return await res.json() as Record<string, unknown>;
    }

    if (res.status === 429) {
      if (i === maxRetries) throw new Error('Jupiter API is rate-limited. Wait a few seconds and try again.');
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      continue;
    }

    // Try to get error body for debugging
    let errorBody = '';
    try { errorBody = await res.text(); } catch { /* ignore */ }
    throw new Error(`Jupiter API returned ${res.status}${errorBody ? ': ' + errorBody.slice(0, 200) : ''}`);
  }
  throw new Error('Unreachable');
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const config = body.config as ArbitrageConfig;

    if (!config || !ALLOWED_PAIRS.includes(config.tradingPair)) {
      return Response.json(
        { success: false, timestamp: Date.now(), message: 'Invalid trading pair.' } as DryRunResult,
        { status: 400 }
      );
    }

    const [inputToken] = config.tradingPair.split('/');
    const inputMint = MINT_MAP[inputToken];
    const outputMint = MINT_MAP.USDC;
    const inputDecimals = DECIMALS[inputToken] || 9;
    const amountIn = Math.floor(config.maxTradeSizeSol * Math.pow(10, inputDecimals));

    // Leg 1: Input token -> USDC
    const buyUrl = new URL(`${JUPITER_API}/quote`);
    buyUrl.searchParams.set('inputMint', inputMint);
    buyUrl.searchParams.set('outputMint', outputMint);
    buyUrl.searchParams.set('amount', amountIn.toString());
    buyUrl.searchParams.set('slippageBps', '10');

    let buyQuote: Record<string, unknown>;
    try {
      buyQuote = await fetchWithRetry(buyUrl);
    } catch (e) {
      return Response.json({
        success: false,
        timestamp: Date.now(),
        message: e instanceof Error ? e.message : 'Leg 1 quote failed.',
      } as DryRunResult, { status: 502 });
    }

    if (!buyQuote.outAmount) {
      return Response.json({
        success: false,
        timestamp: Date.now(),
        message: 'Jupiter returned no route for Leg 1. The pair may have insufficient liquidity.',
      } as DryRunResult, { status: 502 });
    }

    const usdcOut = Number(buyQuote.outAmount) / 1e6;
    const priceImpactBuy = Number(buyQuote.priceImpactPct || 0);

    // Leg 2: USDC -> Input token (round-trip)
    const sellUrl = new URL(`${JUPITER_API}/quote`);
    sellUrl.searchParams.set('inputMint', outputMint);
    sellUrl.searchParams.set('outputMint', inputMint);
    sellUrl.searchParams.set('amount', String(buyQuote.outAmount));
    sellUrl.searchParams.set('slippageBps', '10');

    let sellQuote: Record<string, unknown>;
    try {
      sellQuote = await fetchWithRetry(sellUrl);
    } catch (e) {
      return Response.json({
        success: false,
        timestamp: Date.now(),
        message: e instanceof Error ? e.message : 'Leg 2 quote failed.',
      } as DryRunResult, { status: 502 });
    }

    if (!sellQuote.outAmount) {
      return Response.json({
        success: false,
        timestamp: Date.now(),
        message: 'Jupiter returned no route for Leg 2. The pair may have insufficient liquidity.',
      } as DryRunResult, { status: 502 });
    }

    const returnAmount = Number(sellQuote.outAmount) / Math.pow(10, inputDecimals);
    const priceImpactSell = Number(sellQuote.priceImpactPct || 0);

    // Profit calculation
    const currentPrice = usdcOut / config.maxTradeSizeSol;
    const grossProfitSol = returnAmount - config.maxTradeSizeSol;
    const grossProfitUsdc = grossProfitSol * currentPrice;

    const jitoTipUsdc = config.executionSpeed === 'jito' ? config.jitoTipSol * currentPrice : 0;
    const txFeeUsdc = TX_FEE_SOL * currentPrice;
    const totalFeesUsdc = jitoTipUsdc + txFeeUsdc;
    const netProfitUsdc = grossProfitUsdc - totalFeesUsdc;

    const result: DryRunResult = {
      success: true,
      timestamp: Date.now(),
      pair: config.tradingPair,
      inputAmount: config.maxTradeSizeSol,
      outputAmount: usdcOut,
      roundTripReturn: returnAmount,
      currentPrice,
      priceImpact: Math.abs(priceImpactBuy) + Math.abs(priceImpactSell),
      estimatedProfit: netProfitUsdc,
      gasAndFeesUsdc: totalFeesUsdc,
      message: netProfitUsdc > 0
        ? `A ${config.maxTradeSizeSol} ${inputToken} round-trip yields ~$${netProfitUsdc.toFixed(4)} net profit at current prices.`
        : `No profitable arbitrage found. Net loss after fees: $${Math.abs(netProfitUsdc).toFixed(4)}.`,
    };

    return Response.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return Response.json(
      { success: false, timestamp: Date.now(), message: msg } as DryRunResult,
      { status: 500, headers: { 'X-Content-Type-Options': 'nosniff' } }
    );
  }
}
