'use client';

import React, { useMemo, useState } from 'react';
import type { ArbitrageConfig } from '@/types/bot';

interface CodePreviewProps {
  arbConfig: ArbitrageConfig;
}

// Tokenizer approach: split each line into tokens, classify, wrap in spans
// This avoids all the nested-regex problems and PrismJS SSR issues

interface Token { type: string; value: string; }

const KW = new Set(['const','let','var','async','await','function','if','else','return','import','from','new','export','throw','try','catch','true','false','typeof','instanceof']);

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Whitespace
    if (/\s/.test(line[i])) {
      let start = i;
      while (i < line.length && /\s/.test(line[i])) i++;
      tokens.push({ type: 'plain', value: line.slice(start, i) });
      continue;
    }

    // Line comment
    if (line[i] === '/' && line[i + 1] === '/') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // Strings
    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      j++; // include closing quote
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i])) {
      let start = i;
      while (i < line.length && /[0-9._]/.test(line[i])) i++;
      tokens.push({ type: 'number', value: line.slice(start, i) });
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(line[i])) {
      let start = i;
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) i++;
      const word = line.slice(start, i);
      // Check if followed by ( => function call
      const rest = line.slice(i);
      if (KW.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (/^\s*\(/.test(rest)) {
        tokens.push({ type: 'func', value: word });
      } else {
        tokens.push({ type: 'ident', value: word });
      }
      continue;
    }

    // Punctuation / operators
    tokens.push({ type: 'punct', value: line[i] });
    i++;
  }

  return tokens;
}

const COLOR_MAP: Record<string, string> = {
  comment: '#6b7280',
  string: '#a3e635',
  number: '#f97316',
  keyword: '#e4e4e7',
  func: '#d4d4d8',
  punct: '#71717a',
  ident: '#a1a1aa',
  plain: '',
};

const WEIGHT_MAP: Record<string, string> = {
  keyword: '600',
  func: '500',
};

const STYLE_MAP: Record<string, string> = {
  comment: 'italic',
};

function renderLine(line: string, lineNum: number): React.ReactNode {
  const tokens = tokenizeLine(line);
  return (
    <div key={lineNum} className="flex">
      <span className="select-none text-zinc-700 w-8 text-right mr-4 flex-shrink-0">
        {lineNum}
      </span>
      <span>
        {tokens.map((t, j) => (
          <span
            key={j}
            style={{
              color: COLOR_MAP[t.type] || '#a1a1aa',
              fontWeight: WEIGHT_MAP[t.type] || 'normal',
              fontStyle: STYLE_MAP[t.type] || 'normal',
            }}
          >
            {t.value}
          </span>
        ))}
      </span>
    </div>
  );
}

export default function CodePreview({ arbConfig }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    return `// Arbitrator Bot — Generated Preview
// Pair: ${arbConfig.tradingPair}
// Venues: ${arbConfig.exchanges.join(', ').toUpperCase()}

import { Connection, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, NATIVE_MINT } from '@solana/spl-token';

const TRADE_AMOUNT_SOL = ${arbConfig.maxTradeSizeSol};
const MIN_PROFIT_USDC = ${arbConfig.minProfitUsdc};
const SLIPPAGE_BPS = 10;

async function executeArbitrage(opportunity) {
  const { buyQuote, sellQuote, profitUsdc } = opportunity;

  if (profitUsdc < MIN_PROFIT_USDC) return;

  // 1. Wrap SOL into WSOL
  const wsolAta = getAssociatedTokenAddressSync(NATIVE_MINT, wallet);
  tx.add(createWsolAccount(wsolAta, TRADE_AMOUNT_SOL));
  tx.add(syncNativeInstruction(wsolAta));

  // 2. Execute both swap legs atomically
  tx.add(buildSwapIx(buyQuote));   // SOL -> USDC
  tx.add(buildSwapIx(sellQuote));  // USDC -> SOL

  // 3. Unwrap WSOL back to SOL
  tx.add(closeWsolAccount(wsolAta));
${arbConfig.executionSpeed === 'jito'
  ? `
  // 4. Jito bundle (tip: ${arbConfig.jitoTipSol} SOL)
  tx.add(buildJitoTip(${arbConfig.jitoTipSol}));
  await sendJitoBundle(tx);`
  : `
  // 4. Send via standard RPC
  await sendTransaction(tx);`}
}`;
  }, [arbConfig]);

  const lines = useMemo(() => code.split('\n'), [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="brutal-border bg-zinc-950 flex flex-col">
      <div className="px-4 py-3 brutal-border-b bg-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <span className="text-[10px] font-mono text-zinc-500 ml-2">
            preview.ts
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[10px] font-mono font-bold text-zinc-500 hover:text-orange-500 uppercase tracking-widest transition-colors cursor-pointer"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-auto max-h-[480px]">
        <pre className="p-4 m-0 text-[11px] leading-[1.7] font-mono">
          {lines.map((line, i) => renderLine(line, i + 1))}
        </pre>
      </div>
    </div>
  );
}
