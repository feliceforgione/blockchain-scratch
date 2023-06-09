const hexToBinary = require("hex-to-binary");
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../util");

/**
 * Represents a block in a blockchain.
 */
class Block {
  /**
   * Constructs a new Block instance.
   * @param {Object} params - The parameters for block construction.
   * @param {string} params.timestamp - The timestamp of the block.
   * @param {string} params.lastHash - The hash of the previous block.
   * @param {string} params.hash - The hash of the current block.
   * @param {*} params.data - The data stored in the block.
   * @param {number} params.nonce - The nonce value of the block.
   * @param {number} params.difficulty - The difficulty level of mining the block.
   */
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  /**
   * Creates the genesis block.
   * @returns {Block} The genesis block.
   */
  static genesis() {
    return new this(GENESIS_DATA);
  }

  /**
   * Adjusts the difficulty level based on the time it took to mine original block.
   * @param {Object} params - The parameters for adjusting difficulty.
   * @param {Block} params.originalBlock - The original block.
   * @param {number} params.timestamp - The current timestamp.
   * @returns {number} The adjusted difficulty level.
   */
  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    if (difficulty < 1) return 1;
    const timeTaken = timestamp - originalBlock.timestamp;
    return timeTaken > MINE_RATE ? difficulty - 1 : difficulty + 1;
  }

  /**
   * Mines a new block.
   * @param {Object} params - The parameters for mining a block.
   * @param {Block} params.lastBlock - The last block in the blockchain.
   * @param {*} params.data - The data to be stored in the new block.
   * @returns {Block} The mined block.
   */
  static mineBlock({ lastBlock, data }) {
    let hash;
    let timestamp;
    let { difficulty } = lastBlock;
    let nonce = 0;
    const lastHash = lastBlock.hash;

    do {
      nonce++;
      timestamp = new Date().toJSON();
      difficulty = this.adjustDifficulty({
        originalBlock: lastBlock,
        timestamp,
      });
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while (
      hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)
    );

    return new this({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash,
    });
  }
}

module.exports = Block;
