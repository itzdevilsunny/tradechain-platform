# TradeChain — Algorithmic Trading & Cryptographic Audit Platform 🚀

[![Build Status](https://img.shields.io/badge/Build-Passing-10B981?style=flat-square)](https://github.com/itzdevilsunny/tradechain-platform)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**TradeChain** is an advanced, institutional-grade **algorithmic trading bot, backtesting suite, and blockchain-based trade audit platform** localized for the **Indian Stock Market (NSE/BSE)** and Crypto Derivatives ecosystem.

It bridges real-time algorithmic strategy execution (Upstox, Groww, Zerodha Kite Gateways) with immutable Proof-of-Authority (PoA) blockchain verification, ensuring zero-knowledge, tamper-evident trade receipts.

---

## 🌟 Key Features

- 📈 **NSE / BSE Intraday Terminal**: Live candlestick chart (NIFTY 50 Futures, BANK NIFTY, RELIANCE, TCS, BTC/INR) with 20/50 EMA overlays and real-time tick engines.
- 🔗 **Cryptographic Block Proofs**: Every trade execution digest is bound to a Merkle tree root and signed via ECDSA (secp256k1).
- 🌳 **Interactive Merkle Tree Visualizer**: Audit 3-tier node proof trees (Root -> Hashes -> Leaves) with hoverable inclusion path highlighting.
- 🛡️ **SEBI Risk Control Center**: Enforces pre-trade margin checks, intraday daily loss caps (₹5,000 max drawdown), and position sizing limits.
- 🧪 **Quant Backtest Lab**: Deterministic simulation engine computing Cumulative Equity Curves, Win Rate (71.4%), Sharpe Ratio (2.18), and Drawdown Depth Spectrums.
- 🤖 **TradeChain AI Copilot**: Instant evidence-based assistant powered by Groq (LLaMA 3.3) & Gemini 1.5 APIs with floating draggable UI.
- 🌗 **Dual Theme Engine**: Tactile 3D Pop button outlook supporting both Dark Mode (`#080A0F`) and Light Mode (`#F8FAFC`).
- ⚡ **1-Click Auto Authentication**: Pre-filled admin credentials for instant desk access.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript 5.7, Vite 6, Tailwind CSS, Recharts, Lucide Icons, Framer Motion.
- **Database & Auth**: Supabase PostgreSQL (`trrdxwefrnjlzkrrnjdp.supabase.co`).
- **AI Models**: Groq LLaMA-3.3-70b & Google Gemini 1.5 Flash.
- **Cryptographic Hash**: SHA-256 state digests & Secp256k1 ECDSA signatures.

---

## 🚀 Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/itzdevilsunny/tradechain-platform.git
cd tradechain-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Run Local Development Server
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### 5. Production Build
```bash
npm run build
```

---

## 🔐 Cryptographic Verification Workflow

```
Market Order Intake -> SHA-256 Digest -> ECDSA SECP256K1 Signature -> Merkle Leaf -> Consortium Block #4281 -> Immutability Attested
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
