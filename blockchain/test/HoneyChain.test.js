const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('HoneyChain', function () {
  let contract;

  beforeEach(async function () {
    const HoneyChain = await ethers.getContractFactory('HoneyChain');
    contract = await HoneyChain.deploy();
    await contract.waitForDeployment();
  });

  it('records a new batch', async function () {
    await contract.recordBatch('HC-2026-AHM-0001', 'hash123');
    const verified = await contract.verifyBatch('HC-2026-AHM-0001');
    expect(verified).to.equal(true);
  });

  it('rejects duplicate batch IDs', async function () {
    await contract.recordBatch('HC-2026-AHM-0001', 'hash123');
    await expect(contract.recordBatch('HC-2026-AHM-0001', 'hash456')).to.be.revertedWith(
      'HoneyChain: batch already recorded'
    );
  });

  it('adds traceability events to an existing batch', async function () {
    await contract.recordBatch('HC-2026-AHM-0001', 'hash123');
    await contract.addTraceabilityEvent('HC-2026-AHM-0001', 'HARVESTED', 'eventHash1');
    await contract.addTraceabilityEvent('HC-2026-AHM-0001', 'EXTRACTED', 'eventHash2');

    const count = await contract.getEventCount('HC-2026-AHM-0001');
    expect(count).to.equal(2);

    const event = await contract.getEvent('HC-2026-AHM-0001', 0);
    expect(event[0]).to.equal('HARVESTED');
  });

  it('fails to add an event to a non-existent batch', async function () {
    await expect(
      contract.addTraceabilityEvent('HC-9999-XXX-0000', 'HARVESTED', 'hash')
    ).to.be.revertedWith('HoneyChain: batch does not exist');
  });

  it('returns false for verifyBatch on unknown batch', async function () {
    // verifyBatch simply returns false rather than reverting, so consumers
    // scanning an invalid QR code get a clean "not found" rather than an error
    const verified = await contract.verifyBatch('HC-UNKNOWN');
    expect(verified).to.equal(false);
  });

  it('rejects a duplicate batch ID even from a different account', async function () {
    // Regression test: during development, a batch-ID generator bug caused
    // the same ID to be attempted twice (once successfully recorded on-chain,
    // then rejected by the database's unique constraint, then retried).
    // The contract must reject the second on-chain attempt regardless of
    // which account sends it, so the on-chain and off-chain records never
    // silently diverge.
    const [owner, otherAccount] = await ethers.getSigners();
    await contract.connect(owner).recordBatch('HC-2026-AHM-0004', 'hash-original');

    await expect(
      contract.connect(otherAccount).recordBatch('HC-2026-AHM-0004', 'hash-retry')
    ).to.be.revertedWith('HoneyChain: batch already recorded');

    // The original record must remain untouched
    const [dataHash, recordedBy] = await contract.getBatch('HC-2026-AHM-0004');
    expect(dataHash).to.equal('hash-original');
    expect(recordedBy).to.equal(owner.address);
  });

  it('preserves correct event order when multiple events are added quickly', async function () {
    await contract.recordBatch('HC-2026-RAJ-0001', 'hash1');
    await contract.addTraceabilityEvent('HC-2026-RAJ-0001', 'HARVESTED', 'h1');
    await contract.addTraceabilityEvent('HC-2026-RAJ-0001', 'EXTRACTED', 'h2');
    await contract.addTraceabilityEvent('HC-2026-RAJ-0001', 'PROCESSED', 'h3');

    const count = await contract.getEventCount('HC-2026-RAJ-0001');
    expect(count).to.equal(3);

    const [firstType] = await contract.getEvent('HC-2026-RAJ-0001', 0);
    const [lastType] = await contract.getEvent('HC-2026-RAJ-0001', 2);
    expect(firstType).to.equal('HARVESTED');
    expect(lastType).to.equal('PROCESSED');
  });
});
