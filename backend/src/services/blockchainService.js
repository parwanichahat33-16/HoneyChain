const { ethers } = require('ethers');
require('dotenv').config();

// ABI matches blockchain/contracts/HoneyChain.sol
const CONTRACT_ABI = [
  'function recordBatch(string batchId, string dataHash) external',
  'function addTraceabilityEvent(string batchId, string eventType, string dataHash) external',
  'function getBatch(string batchId) external view returns (string, address, uint256, bool)',
  'function verifyBatch(string batchId) external view returns (bool)',
  'event BatchRecorded(string batchId, address indexed recordedBy, uint256 timestamp)',
  'event TraceabilityEventAdded(string batchId, string eventType, uint256 timestamp)',
];

let provider;
let wallet;
let contract;

function getContract() {
  if (contract) return contract;
  if (!process.env.CONTRACT_ADDRESS || !process.env.DEPLOYER_PRIVATE_KEY) {
    return null; // blockchain not configured yet — caller should handle gracefully
  }
  provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545');
  wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  return contract;
}

function hashPayload(payload) {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(payload)));
}

/**
 * Records a new batch on-chain. Only stores batchId + a hash of the
 * off-chain record — never large data or files.
 */
async function recordBatchOnChain(batchId, batchSummary) {
  const c = getContract();
  if (!c) return { txHash: null, note: 'Blockchain not configured — running in DB-only mode' };
  const dataHash = hashPayload(batchSummary);
  const tx = await c.recordBatch(batchId, dataHash);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, dataHash };
}

async function addEventOnChain(batchId, eventType, eventDetails) {
  const c = getContract();
  if (!c) return { txHash: null, note: 'Blockchain not configured — running in DB-only mode' };
  const dataHash = hashPayload(eventDetails);
  const tx = await c.addTraceabilityEvent(batchId, eventType, dataHash);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, dataHash };
}

async function verifyBatchOnChain(batchId) {
  const c = getContract();
  if (!c) return { verified: false, note: 'Blockchain not configured — running in DB-only mode' };
  const verified = await c.verifyBatch(batchId);
  return { verified };
}

/**
 * Returns the full on-chain record for a batch: its integrity hash,
 * who recorded it, when, and every traceability event stored on-chain.
 * Used by the consumer verification page's "Verify Blockchain Record" detail view.
 */
async function getBatchOnChainDetails(batchId) {
  const c = getContract();
  if (!c) return null;

  const verified = await c.verifyBatch(batchId);
  if (!verified) return { exists: false };

  const [dataHash, recordedBy, timestamp] = await c.getBatch(batchId);
  const eventCount = await c.getEventCount(batchId);

  const events = [];
  for (let i = 0; i < Number(eventCount); i++) {
    const [eventType, eventTimestamp, eventHash] = await c.getEvent(batchId, i);
    events.push({
      eventType,
      timestamp: new Date(Number(eventTimestamp) * 1000).toISOString(),
      dataHash: eventHash,
    });
  }

  return {
    exists: true,
    dataHash,
    recordedBy,
    timestamp: new Date(Number(timestamp) * 1000).toISOString(),
    onChainEvents: events,
  };
}

module.exports = { recordBatchOnChain, addEventOnChain, verifyBatchOnChain, getBatchOnChainDetails, hashPayload };
