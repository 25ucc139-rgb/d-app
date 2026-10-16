# ⚡ SentinelPay

> **A Web3 Payment Firewall for AI Agents on Ethereum**

SentinelPay is a production-ready decentralized application (dApp) that acts as a smart-contract-enforced **security layer** between AI agents and on-chain funds. It lets a contract owner whitelist AI agents, set hard spending limits, and pause/resume them instantly — all enforced trustlessly by the Ethereum blockchain.

---

## 📑 Table of Contents

- [What is SentinelPay?](#what-is-sentinelpay)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [1. Clone & Install](#1-clone--install)
  - [2. Configure Environment](#2-configure-environment)
  - [3. Compile & Deploy the Smart Contract](#3-compile--deploy-the-smart-contract)
  - [4. Set Up the Frontend](#4-set-up-the-frontend)
  - [5. Run the App](#5-run-the-app)
- [Using the dApp](#using-the-dapp)
  - [Connect Your Wallet](#connect-your-wallet)
  - [Owner Dashboard](#owner-dashboard)
  - [Agent Simulator Panel](#agent-simulator-panel)
  - [Transaction Log](#transaction-log)
- [Smart Contract Reference](#smart-contract-reference)
- [Environment Variables](#environment-variables)
- [Deployment to Vercel](#deployment-to-vercel)
- [FAQ & Troubleshooting](#faq--troubleshooting)
- [License](#license)

---

## What is SentinelPay?

In a world where AI agents autonomously execute tasks on-chain, **unchecked spending is a serious risk**. SentinelPay solves this by putting a smart-contract firewall in front of every payment:

- 🛡️ **Only registered agents** can trigger payments.
- 💸 **Hard spending limits** per agent — enforced by the contract, not trust.
- ⏸️ **Instant pause/resume** — shut down a misbehaving agent in one transaction.
- 📋 **Immutable audit log** — every payment is emitted as a blockchain event.
- 🔒 **Reentrancy-safe** — built with OpenZeppelin's `ReentrancyGuard`.

---

## How It Works

```
  ┌─────────────┐   registerAgent()    ┌───────────────────┐
  │  Owner      │ ──────────────────►  │                   │
  │  (MetaMask) │   pauseAgent()       │   SentinelPay     │
  │             │ ◄──────────────────  │   Smart Contract  │
  └─────────────┘   updateLimit()      │   (Sepolia)       │
                                       │                   │
  ┌─────────────┐   executePayment()   │                   │
  │  AI Agent   │ ──────────────────►  │  ✓ Checks:        │
  │  (Wallet)   │                      │  - Registered?    │
  └─────────────┘                      │  - Not paused?    │
                                       │  - Within limit?  │
                                       └───────────────────┘
```

1. **Owner** deploys the contract and deposits ETH into its vault.
2. **Owner** registers AI agent wallet addresses and assigns each a maximum spending limit (in ETH).
3. **AI Agents** call `executePayment()` to pay a recipient. The contract validates all three rules before releasing funds.
4. Any transaction that violates the rules is **reverted on-chain** — no funds are lost.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity `^0.8.24`, OpenZeppelin v5 |
| Contract Tooling | Hardhat, `@nomicfoundation/hardhat-toolbox` |
| Frontend Framework | React 18 + Vite |
| Blockchain Library | ethers.js v6 |
| Wallet Integration | MetaMask (EIP-1193) |
| Network | Ethereum Sepolia Testnet |
| Deployment | Vercel (frontend) |

---

## Project Structure

```
d app/
├── contracts/
│   └── SentinelPay.sol        # Core smart contract
├── scripts/
│   └── deploy.js              # Hardhat deployment script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx       # Hero / connect-wallet screen
│   │   │   ├── OwnerDashboard.jsx    # Agent management UI
│   │   │   └── AgentSimulator.jsx    # Simulated agent payment UI
│   │   ├── utils/
│   │   │   └── contract.js           # ethers.js helpers & ABI
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── hardhat.config.js
├── .env.example               # Template for required env vars
├── vercel.json
└── package.json
```

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9.x | Included with Node.js |
| MetaMask | Latest | [metamask.io](https://metamask.io) |
| Git | Any | [git-scm.com](https://git-scm.com) |

You will also need:
- A **Sepolia testnet RPC URL** — get one for free from [Alchemy](https://alchemy.com) or [Infura](https://infura.io).
- A **wallet private key** (use a dedicated test wallet — **never your main wallet**).
- Some **Sepolia ETH** for gas — get it from the [Sepolia Faucet](https://sepoliafaucet.com).

---

## Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd "d app"

# Install Hardhat dependencies (root)
npm install
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PRIVATE_KEY=0xYOUR_WALLET_PRIVATE_KEY_HERE
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

> ⚠️ **Security Warning:** Never commit your `.env` file to version control. It is already listed in `.gitignore`.

### 3. Compile & Deploy the Smart Contract

```bash
# Compile the Solidity contract
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

The terminal will print the deployed contract address, for example:

```
SentinelPay deployed to: 0xAbCd1234...
```

📋 **Copy this address** — you'll need it in the next step.

### 4. Set Up the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install
```

Open `frontend/src/utils/contract.js` and update the contract address:

```js
// Option A — set it directly (for local dev only):
export const CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS_HERE';

// Option B (recommended) — create frontend/.env and add:
// VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS_HERE
```

### 5. Run the App

```bash
# From inside the /frontend directory:
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** 🎉

---

## Using the dApp

### Connect Your Wallet

1. Open the app in your browser.
2. Make sure MetaMask is installed and configured on the **Sepolia Testnet**.
3. Click **"Connect MetaMask"** on the landing screen.
4. Approve the connection request in the MetaMask popup.

> ℹ️ The app detects your role automatically. If your connected address is the **contract owner**, you will see the Owner Dashboard. Any other address sees the Agent Simulator Panel.

---

### Owner Dashboard

The Owner Dashboard gives the contract deployer full control over registered AI agents.

#### Register a New Agent

| Field | Description |
|---|---|
| **Agent Address** | The Ethereum wallet address of the AI agent (`0x...`) |
| **Spending Limit (ETH)** | The maximum cumulative ETH the agent is allowed to spend |

Click **"+ REGISTER AGENT"** and confirm the MetaMask transaction.

#### Deposit ETH to the Contract Vault

Agents can only spend from the contract's balance — not from your wallet directly. You must first deposit ETH:

1. Enter an amount in the **"Deposit ETH to Contract"** form.
2. Click **"↑ DEPOSIT"** and confirm in MetaMask.

The **Contract Vault** balance updates in real time.

#### Manage Agents

The Registered Agents table shows every agent's:
- Wallet address
- Spending limit
- Total ETH already spent
- Current status (`ACTIVE` / `PAUSED`)

Use the **PAUSE** button to instantly block an agent from making payments. Use **RESUME** to re-enable them. These actions take effect on-chain immediately.

---

### Agent Simulator Panel

This panel lets you act as a registered AI agent and test the payment flow.

> 💡 Connect MetaMask with a wallet that has been **registered by the owner** to use this panel.

| Field | Description |
|---|---|
| **Recipient Address** | The Ethereum address to send funds to (`0x...`) |
| **Amount (ETH)** | How much ETH to send (e.g., `0.001`) |
| **Reason / Context** | A human-readable label for this payment (stored on-chain) |

Click **"⚡ EXECUTE PAYMENT"** and approve in MetaMask.

**Payment outcomes:**

| Result | Reason |
|---|---|
| ✓ PAYMENT APPROVED | Transaction confirmed on-chain; link to Etherscan shown |
| ✗ TRANSACTION BLOCKED | Agent not registered, is paused, or exceeds spending limit |

---

### Transaction Log

The app automatically indexes `PaymentExecuted` events from the contract and displays them in a live transaction log. No page refresh needed — new payments appear as they are confirmed on-chain.

---

## Smart Contract Reference

**Contract:** `SentinelPay.sol` — deployed on Ethereum Sepolia Testnet.

### Functions

| Function | Access | Description |
|---|---|---|
| `registerAgent(address, uint256)` | Owner only | Whitelist an agent with a spending limit |
| `executePayment(address, uint256, string)` | Registered agents only | Send ETH to a recipient with a reason label |
| `pauseAgent(address)` | Owner only | Block an agent from making payments |
| `unpauseAgent(address)` | Owner only | Re-enable a paused agent |
| `updateLimit(address, uint256)` | Owner only | Change an agent's spending cap |
| `getAgentInfo(address)` | Public view | Read an agent's limit, spent amount, and pause state |
| `withdrawFunds()` | Owner only | Pull all ETH from the contract back to the owner |
| `receive()` | Public payable | Accept ETH deposits into the contract vault |

### Events

| Event | Emitted When |
|---|---|
| `AgentRegistered(agent, limit)` | A new agent is whitelisted |
| `PaymentExecuted(agent, recipient, amount, reason, timestamp)` | A payment is approved and sent |
| `AgentPaused(agent)` | An agent is paused |
| `AgentUnpaused(agent)` | An agent is resumed |
| `LimitUpdated(agent, newLimit)` | An agent's spending cap is changed |

### Security

- **`Ownable`** — all admin functions are restricted to the deployer address.
- **`ReentrancyGuard`** — `executePayment` is protected against reentrancy attacks.
- All inputs are validated with `require` statements before any state change.

---

## Environment Variables

### Root (Hardhat)

Create a `.env` file in the project root:

| Variable | Required | Description |
|---|---|---|
| `PRIVATE_KEY` | ✅ | Private key of the deployer wallet (with `0x` prefix) |
| `SEPOLIA_RPC_URL` | ✅ | HTTP RPC endpoint for the Sepolia network |

### Frontend

Create a `.env` file inside the `frontend/` directory:

| Variable | Required | Description |
|---|---|---|
| `VITE_CONTRACT_ADDRESS` | ✅ | The deployed `SentinelPay` contract address |

---

## Deployment to Vercel

The project includes a `vercel.json` configuration for easy frontend deployment.

```bash
# From the repo root, install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel --prod
```

Set `VITE_CONTRACT_ADDRESS` as an **Environment Variable** in your Vercel project dashboard under **Settings → Environment Variables**.

---

## FAQ & Troubleshooting

**Q: MetaMask says "Wrong Network".**
> Switch MetaMask to **Sepolia Testnet**. Go to MetaMask → Settings → Networks → Sepolia, or add it via [chainlist.org](https://chainlist.org/?search=sepolia&testnets=true).

**Q: I get "Agent not registered" when trying to execute a payment.**
> Your connected MetaMask wallet has not been registered by the contract owner. Ask the owner to call `registerAgent` with your address.

**Q: The Owner Dashboard shows "Contract not deployed on this network".**
> Make sure you deployed the contract to Sepolia and set the correct `VITE_CONTRACT_ADDRESS` in your frontend `.env` file.

**Q: MetaMask popup already open — check the MetaMask icon.**
> You have a pending MetaMask transaction. Open the MetaMask extension, review the pending request, and either confirm or reject it.

**Q: Payments are blocked even though my agent is registered and active.**
> Check if the agent's **total spent** amount has reached its **spending limit**. The owner needs to call `updateLimit` to raise the cap, or `withdrawFunds` and re-deposit to reset balances.

**Q: Where do I get Sepolia ETH for testing?**
> Use any of these faucets:
> - [sepoliafaucet.com](https://sepoliafaucet.com)
> - [faucet.sepolia.dev](https://faucet.sepolia.dev)
> - [Alchemy Sepolia Faucet](https://sepoliafaucet.com)

---

## License

MIT — feel free to fork, modify, and build on top of SentinelPay.

---

*Built securely for the Decentralized Web. 🛡️*

<!-- Revision: 2026-10-27 - chore: release v1.0.0 production deployment ready build -->

<!-- Revision: 2026-10-16 - docs: update README with live demo link, screenshots, and setup commands -->
