// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneyChain
 * @notice Tamper-evident integrity layer for honey batch traceability.
 *         Stores ONLY lightweight identifiers and hashes on-chain —
 *         batch details, sensor data, and images stay in the off-chain
 *         database. This contract exists to prove that a given
 *         traceability record has not been altered after the fact,
 *         not to prove the chemical purity of the honey itself.
 */
contract HoneyChain {
    struct Batch {
        string batchId;
        address recordedBy;
        uint256 timestamp;
        string dataHash;   // keccak256 hash of the off-chain batch summary
        bool exists;
    }

    struct TraceEvent {
        string eventType;  // HARVESTED, EXTRACTED, PROCESSED, PACKAGED, DISTRIBUTED
        uint256 timestamp;
        string dataHash;
    }

    mapping(string => Batch) private batches;
    mapping(string => TraceEvent[]) private batchEvents;

    event BatchRecorded(string batchId, address indexed recordedBy, uint256 timestamp);
    event TraceabilityEventAdded(string batchId, string eventType, uint256 timestamp);

    modifier batchMustExist(string memory batchId) {
        require(batches[batchId].exists, "HoneyChain: batch does not exist");
        _;
    }

    /**
     * @notice Registers a new honey batch on-chain.
     * @param batchId Human-readable batch identifier, e.g. "HC-2026-AHM-0001"
     * @param dataHash keccak256 hash of the off-chain batch record (for integrity checks)
     */
    function recordBatch(string memory batchId, string memory dataHash) external {
        require(!batches[batchId].exists, "HoneyChain: batch already recorded");
        batches[batchId] = Batch({
            batchId: batchId,
            recordedBy: msg.sender,
            timestamp: block.timestamp,
            dataHash: dataHash,
            exists: true
        });
        emit BatchRecorded(batchId, msg.sender, block.timestamp);
    }

    /**
     * @notice Appends a new traceability event to an existing batch.
     */
    function addTraceabilityEvent(
        string memory batchId,
        string memory eventType,
        string memory dataHash
    ) external batchMustExist(batchId) {
        batchEvents[batchId].push(
            TraceEvent({ eventType: eventType, timestamp: block.timestamp, dataHash: dataHash })
        );
        emit TraceabilityEventAdded(batchId, eventType, block.timestamp);
    }

    /**
     * @notice Returns the core on-chain record for a batch.
     */
    function getBatch(string memory batchId)
        external
        view
        batchMustExist(batchId)
        returns (string memory dataHash, address recordedBy, uint256 timestamp, bool exists)
    {
        Batch memory b = batches[batchId];
        return (b.dataHash, b.recordedBy, b.timestamp, b.exists);
    }

    /**
     * @notice Returns the number of traceability events recorded for a batch.
     */
    function getEventCount(string memory batchId) external view returns (uint256) {
        return batchEvents[batchId].length;
    }

    /**
     * @notice Returns a single traceability event by index.
     */
    function getEvent(string memory batchId, uint256 index)
        external
        view
        returns (string memory eventType, uint256 timestamp, string memory dataHash)
    {
        TraceEvent memory e = batchEvents[batchId][index];
        return (e.eventType, e.timestamp, e.dataHash);
    }

    /**
     * @notice Simple existence/integrity check used by the consumer verification page.
     */
    function verifyBatch(string memory batchId) external view returns (bool) {
        return batches[batchId].exists;
    }
}
