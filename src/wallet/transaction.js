const { v4: uuidv4 } = require("uuid");
const { verifySignature } = require("../util");
const { MINING_REWARD, REWARD_INPUT } = require("../config");

/**
 * Represents a transaction in a blockchain.
 */
class Transaction {
  /**
   * Constructs a new Transaction instance.
   * @param {Object} params - The parameters for creating a transaction.
   * @param {Wallet} params.senderWallet - The sender's wallet.
   * @param {string} params.recipient - The recipient's address.
   * @param {number} params.amount - The amount to be sent.
   * @param {Object} params.outputMap - The output map of the transaction.
   * @param {Object} params.input - The input of the transaction.
   */
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    /**
     * The unique identifier of the transaction.
     * @type {string}
     */
    this.id = uuidv4();

    /**
     * The output map of the transaction.
     * @type {Object.<string, number>}
     */
    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, recipient, amount });

    /**
     * The input of the transaction.
     * @type {Object}
     */
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  /**
   * Checks if a transaction is valid.
   * @param {Transaction} transaction - The transaction to be validated.
   * @returns {boolean} True if the transaction is valid, false otherwise.
   */
  static validTransaction(transaction) {
    const { input, outputMap } = transaction;

    const { address, amount, signature } = input;

    const outputTotal = Object.values(outputMap).reduce(
      (acc, outputAmount) => acc + outputAmount,
      0
    );

    if (amount !== outputTotal) {
      console.error(`Invalid transaction from ${address}`);
      return false;
    }
    if (!verifySignature({ publicKey: address, data: outputMap, signature })) {
      console.error(`Invalid signature from ${address}`);
      return false;
    }
    return true;
  }

  /**
   * Creates the output map of the transaction.
   * @param {Object} params - The parameters for creating the output map.
   * @param {Wallet} params.senderWallet - The sender's wallet.
   * @param {string} params.recipient - The recipient's address.
   * @param {number} params.amount - The amount to be sent.
   * @returns {Object.<string, number>} The output map of the transaction.
   */
  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  /**
   * Creates the input of the transaction.
   * @param {Object} params - The parameters for creating the input.
   * @param {Wallet} params.senderWallet - The sender's wallet.
   * @param {Object} params.outputMap - The output map of the transaction.
   * @returns {Object} The input of the transaction.
   */
  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  /**
   * Updates the transaction with new details.
   * @param {Object} params - The parameters for updating the transaction.
   * @param {Wallet} params.senderWallet - The sender's wallet.
   * @param {string} params.recipient - The recipient's address.
   * @param {number} params.amount - The amount to be sent.
   */
  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds balance");
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] += amount;
    }

    this.outputMap[senderWallet.publicKey] -= amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  /**
   * Creates a reward transaction for the miner.
   * @param {Object} params - The parameters for creating the reward transaction.
   * @param {Wallet} params.minerWallet - The miner's wallet.
   * @returns {Transaction} The reward transaction.
   */
  static rewardTransaction({ minerWallet }) {
    return new this({
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
      input: REWARD_INPUT,
    });
  }
}

module.exports = Transaction;
