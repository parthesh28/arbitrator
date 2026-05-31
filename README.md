# Arbitrator

A production-ready visual bot builder for Solana cross-DEX spatial arbitrage.

Arbitrator provides a streamlined, professional web interface for configuring, simulating, and generating self-custodial MEV and arbitrage bots. Instead of deploying opaque code to a server you don't control, Arbitrator outputs a raw, heavily-optimized TypeScript project that you can download, review, and execute locally on your own machine.

---

## The Philosophy

- **Self-Custodial**: Your private keys never leave your machine.
- **Transparent**: You download the exact source code. No compiled binaries, no obfuscation.
- **No Telemetry**: The platform does not track your configurations, strategies, or wallets.
- **Production-Ready**: The output code includes WSOL wrapping, Jito bundle integration, Address Lookup Table deduplication, and proper WebSocket graceful shutdown.

## How It Works

Arbitrator abstracts the complexity of Solana transaction building into a simple visual pipeline:

### 1. Configuration
Set your parameters through a clean, jargon-free interface.
- Select trading pairs and target venues (Jupiter routing engine).
- Define minimum profit thresholds (in USDC) and maximum trade size (in SOL).
- Choose execution speed (Standard RPC or Jito bundle integration for MEV protection).

### 2. Analysis
Before you export, the static analysis engine evaluates your strategy:
- Calculates expected Compute Unit (CU) costs based on standard Solana instruction sizes.
- Estimates the base transaction fees and required Jito tips.
- Warns against high price impacts for large trade sizes.

### 3. Simulation (Dry Run)
Test your configuration against live market data.
- Fetches real-time quotes via the Jupiter API.
- Simulates a full round-trip trade (e.g., SOL -> USDC -> SOL).
- Exposes exactly what the Gross Spread, Price Impact, and Gas/Fees would be in the current market state.

### 4. Export
Download a structured `.zip` archive containing a fully-configured Node.js project.
- Unzip the archive.
- `npm install`
- Add your keys to `.env`.
- `npm start`

---

## Technical Architecture

### Frontend Application
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, utilizing a clean, brutalist-inspired Zinc/Orange palette.
- **Components**: React (Functional Components, Hooks).
- **Icons**: Lucide React.
- **Compilation**: The backend uses `jszip` to dynamically generate and bundle the bot code based on the user's real-time React state.

### Generated Bot (Output Project)
The downloaded bot is highly optimized for Solana's architecture:
- **@solana/web3.js**: Core RPC interactions and transaction building.
- **@jup-ag/core**: Jupiter V6 API integration for optimal swap routing.
- **jito-ts**: Official Jito Labs SDK for submitting private bundles to avoid mempool front-running.
- **Manual WSOL Management**: Instead of relying on external helpers, the bot natively creates a Wrapped SOL account, syncs balances, performs the swaps, and closes the account to reclaim rent.
- **ALT Deduplication**: Address Lookup Tables from multiple swap routes are merged and deduplicated to ensure complex arbitrage routes stay within Solana's strict 1232-byte transaction size limit.

---

## Local Development Setup

If you want to run or modify the Arbitrator web platform itself:

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/parthesh28/arbitrator.git
cd arbitrator
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

*(Note: The web platform itself does not require any environment variables to run locally. The generated bot will require its own `.env` file containing RPC URLs and your private key.)*

---

## Roadmap
- [ ] **Dedicated MEV Bot Support**: Expand beyond spatial arbitrage into other MEV strategies (e.g., liquidation bots, sandwiching).
- [ ] **True No-Code Modularity**: Allow users to drag-and-drop conditions, custom logic, and token filters to build highly bespoke bots without writing code.
- [ ] **Multi-hop visualization**: Show exactly which intermediate pools the bot is routing through.
- [ ] **Historical backtesting**: Run the generated strategy against historical Jupiter price data.
- [ ] **Additional execution environments**: Export to Rust (Anchor) for on-chain execution.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Disclaimer

This software is for educational and experimental purposes only. Cryptocurrency trading and MEV arbitrage involve significant risk of financial loss. The generated code is provided as-is without any warranties or guarantees of profitability. Always test with small amounts first and review the generated source code before executing trades with real capital.
