'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const ITEMS: FaqItem[] = [
  {
    question: 'What is a trading pair?',
    answer: 'A trading pair (e.g. SOL/USDC) defines which two tokens the bot monitors for price differences. The bot buys the first token with the second, then sells it back, trying to profit from any price gap between different exchanges.',
  },
  {
    question: 'What are target venues?',
    answer: 'Target venues are the decentralized exchanges (DEXes) the bot scans for price differences. Jupiter aggregates routes across Raydium, Orca, and many others. Selecting multiple venues increases the chance of finding arbitrage opportunities.',
  },
  {
    question: 'What does minimum profit mean?',
    answer: 'This is the smallest price gap (in US dollars) that the bot considers worth executing. If a round-trip trade would net less than this amount after all fees, the bot skips it. Setting this too low means the bot may execute trades where fees eat the profit.',
  },
  {
    question: 'What is max trade size?',
    answer: 'The maximum amount of capital (in SOL) the bot will risk on a single trade. Larger trades can capture more profit but also face higher price impact — your trade itself moves the market price against you, reducing the actual profit.',
  },
  {
    question: 'Standard RPC vs Jito Bundle — what is the difference?',
    answer: 'Standard RPC sends your transaction through the normal Solana network. Other bots can see it and front-run you (execute the same trade before yours lands). Jito bundles send your transaction directly to block-building validators with a tip, which makes your transaction private and gives it priority inclusion.',
  },
  {
    question: 'What is the Jito tip?',
    answer: 'When using Jito, you pay a small tip (in SOL) to the validator who includes your transaction in a block. A higher tip means faster, more reliable inclusion — but it also eats into your profit. Typical tips range from 0.001 to 0.05 SOL depending on network congestion.',
  },
  {
    question: 'How does the bot handle SOL wrapping?',
    answer: 'Solana programs cannot directly use native SOL — they need Wrapped SOL (WSOL). The bot automatically creates a temporary WSOL account, deposits your SOL into it, executes both swap legs, then closes the account and returns any remaining SOL to your wallet. This happens atomically in a single transaction.',
  },
  {
    question: 'Is my private key safe?',
    answer: 'Yes. Your private key is stored in a local .env file on your machine and never leaves it. The bot runs entirely on your hardware. This platform generates code — it does not execute trades or store keys.',
  },
];

export default function Walkthrough() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-20 px-6 bg-zinc-950 brutal-border-b" id="walkthrough">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <h2 className="text-sm font-bold font-mono text-orange-500 uppercase tracking-widest mb-2">
            Before You Start
          </h2>
          <p className="text-2xl font-bold uppercase tracking-tight text-zinc-50 max-w-lg">
            Everything you need to know, explained simply.
          </p>
        </div>

        <div className="space-y-0">
          {ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="brutal-border-b">
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between py-5 px-1 text-left group cursor-pointer"
                >
                  <span className={`text-sm font-mono transition-colors ${isOpen ? 'text-zinc-50 font-bold' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform flex-shrink-0 ml-4 ${isOpen ? 'rotate-180 text-orange-500' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
                >
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed px-1">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
