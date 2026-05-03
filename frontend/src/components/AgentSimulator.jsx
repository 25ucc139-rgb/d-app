import React, { useState } from 'react';
import { getContractWithSigner } from '../utils/contract';
import { ethers } from 'ethers';

// Maps ethers / MetaMask error codes to friendly UI messages
const parseEthError = (err) => {
  if (err.code === 4001 || err.code === 'ACTION_REJECTED') return 'Transaction rejected by user.';
  if (err.code === -32002) return 'MetaMask popup already open — check the MetaMask icon.';
  if (err.code === 'NETWORK_ERROR' || err.code === -32603) return 'RPC error — check your network connection.';
  if (err.code === 'INSUFFICIENT_FUNDS') return 'Insufficient funds for this transaction.';
  if (
    err.message?.toLowerCase().includes('wrong network') ||
    err.message?.toLowerCase().includes('chain')
  ) return 'Wrong network — switch MetaMask to Sepolia Testnet.';
  return err.reason || err.shortMessage || err.message || 'Unknown error.';
};

function AgentSimulator({ account }) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState(null);

  const handleExecute = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!ethers.isAddress(recipient)) {
      setResult({ status: 'error', message: 'Invalid recipient address.' });
      return;
    }

    // Use parseEther for safe, overflow-proof validation — avoids JS float issues
    let parsedAmount;
    try {
      parsedAmount = ethers.parseEther(amount.trim());
      if (parsedAmount <= 0n) throw new Error('zero');
    } catch {
      setResult({ status: 'error', message: 'Amount must be a valid positive ETH value (e.g. 0.01).' });
      return;
    }

    setIsExecuting(true);
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.executePayment(recipient, parsedAmount, reason);
      const receipt = await tx.wait();
      setResult({ status: 'success', message: 'Payment executed and verified on-chain.', hash: receipt.hash });
      setRecipient(''); setAmount(''); setReason('');
    } catch (err) {
      setResult({ status: 'error', message: parseEthError(err) });
    } finally {
      setIsExecuting(false);
    }
  };

  const shortAddr = account ? `${account.slice(0, 10)}…${account.slice(-6)}` : 'NOT CONNECTED';

  return (
    <div className="panel panel-accent">
      <h2 className="panel-title">
        <span className="title-icon">⚡</span>
        AGENT SIMULATOR
      </h2>

      {/* Current agent pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)',
        borderRadius: '100px', padding: '0.4rem 0.9rem',
        marginBottom: '1.5rem', width: 'fit-content',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: account ? 'var(--neon)' : 'var(--danger)',
          boxShadow: account ? 'var(--neon-glow)' : 'var(--danger-glow)',
        }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          ACTIVE AGENT:
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: account ? 'var(--text)' : 'var(--danger)' }}>
          {shortAddr}
        </span>
      </div>

      <form onSubmit={handleExecute}>
        <div className="form-group">
          <label htmlFor="recipient-address-input">Recipient Address</label>
          <input
            id="recipient-address-input"
            type="text"
            className="form-control"
            placeholder="0x…"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="payment-amount-input">Amount (ETH)</label>
          <input
            id="payment-amount-input"
            type="number"
            step="any"
            className="form-control"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="payment-reason-input">Reason / Context</label>
          <input
            id="payment-reason-input"
            type="text"
            className="form-control"
            placeholder="e.g. API access fee, compute cost…"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>
        <button
          id="execute-payment-btn"
          type="submit"
          className="btn"
          disabled={isExecuting || !recipient || !amount || !account}
          aria-busy={isExecuting}
          aria-label={isExecuting ? 'Executing payment, please wait' : 'Execute payment'}
          style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
        >
          {isExecuting
            ? <><span className="spinner" />EXECUTING PAYMENT…</>
            : '⚡ EXECUTE PAYMENT'}
        </button>
      </form>

      {result && (
        <div className={`result-box ${result.status}`} role="alert" aria-live="assertive">
          <div className="result-title">
            {result.status === 'success' ? '✓ PAYMENT APPROVED' : '✗ TRANSACTION BLOCKED'}
          </div>
          <div className="result-msg">{result.message}</div>
          {result.hash && (
            <a
              className="result-link"
              href={`https://sepolia.etherscan.io/tx/${result.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default AgentSimulator;
