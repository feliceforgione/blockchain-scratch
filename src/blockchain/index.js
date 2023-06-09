const Block = require("./block");
const { cryptoHash } = require("../util");
const { REWARD_INPUT, MINING_REWARD } = require("../config");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

/**
 * Represents a blockchain.
 */
class Blockchain {
  /**
   * Constructs a new Blockchain instance.
   */
  constructor() {
    this.chain = [Block.genesis()];
  }

  /**
   * Checks the validity of transaction data in the chain.
   * @param {Object} params - The parameters for validating the transaction data.
   * @param {Block[]} params.chain - The chain of blocks to validate.
   * @returns {boolean} True if the transaction data is valid, false otherwise.
   */
  validTransactionData({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const tranasactionSet = new Set();
      let rewardTransactionCount = 0;

      for (const transaction of block.data) {
        if (transaction.input.address === REWARD_INPUT.address) {
          rewardTransactionCount++;

          if (rewardTransactionCount > 1) {
            console.error("Miner rewards exceed limit");
            return false;
          }

          if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
            console.error("Miner reward amound is invalid");
            return false;
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error("Invalid transaction");
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address,
          });

          if (transaction.input.amount !== trueBalance) {
            console.error("Invalid input amount");
            return false;
          }

          if (tranasactionSet.has(transaction)) {
            console.error(
              "An identical transaction appears more than once in the block"
            );
            return false;
          }
          tranasactionSet.add(transaction);
        }
      }
    }
    return true;
  }

  /**
   * Checks if a given chain is valid.
   * @param {Block[]} chain - The chain of blocks to validate.
   * @returns {boolean} True if the chain is valid, false otherwise.
   */
  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      console.log("isValidChain: first block not a genesis block");
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      const actualLastHash = lastBlock.hash;
      if (block.lastHash !== actualLastHash) {
        console.log("isValidChain: lasthash doesnt match");
        return false;
      }

      // Prevent difficult jumps
      if (Math.abs(lastBlock.difficulty - block.difficulty > 1)) {
        console.log("isValidChain: large difficulty jump");
        return false;
      }

      const validatedHash = cryptoHash(
        block.timestamp,
        block.data,
        block.lastHash,
        block.nonce,
        block.difficulty
      );
      if (block.hash !== validatedHash) {
        console.log(
          "isValidChain: validate hash error",
          block.hash,
          validatedHash
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Adds a new block to the blockchain.
   * @param {Object} params - The parameters for adding a new block.
   * @param {any} params.data - The data to be stored in the new block.
   * @returns {Block} The newly added block.
   */
  addBlock({ data }) {
    const lastBlock = this.chain[this.chain.length - 1];
    const newBlock = Block.mineBlock({ lastBlock, data });
    this.chain.push(newBlock);
    return newBlock;
  }

  /**
   * Replaces the current chain with a new chain if it is valid.
   * @param {Block[]} chain - The new chain to replace the current chain.
   * @param {Function} onSuccess - Optional callback function to execute after the chain is replaced.
   */
  replaceChain(chain, onSuccess) {
    if (this.chain.length >= chain.length) {
      console.error("The incoming chain must be longer");
      return;
    }
    if (!Blockchain.isValidChain(chain)) {
      console.error("The incoming chain must be valid");
      return;
    }

    if (!this.validTransactionData({ chain })) {
      console.error("Incoming chain has invalid data");
      return;
    }

    // used to clear transactions that have been mined
    if (onSuccess) onSuccess();
    console.log("replacing chain with ", chain);
    this.chain = chain;
  }
}

module.exports = Blockchain;
