const { STARTING_BALANCE } = require("../config");
const { ec, cryptoHash } = require("../util");
const Transaction = require("./transaction");

/**
 * Represents a wallet that holds a balance and can create transactions.
 */
class Wallet {
  constructor() {
    /**
     * The balance of the wallet.
     * @type {number}
     */
    this.balance = STARTING_BALANCE;

    /**
     * The key pair associated with the wallet.
     * @type {KeyPair}
     */
    this.keyPair = ec.genKeyPair();

    /**
     * The public key of the wallet.
     * @type {string}
     */
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  /**
   * Calculates the balance of the wallet based on the chain and address.
   * @param {Object} params - The parameters for calculating the balance.
   * @param {Array} params.chain - The blockchain.
   * @param {string} params.address - The wallet address.
   * @returns {number} The calculated balance.
   */
  static calculateBalance({ chain, address }) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for (let i = chain.length - 1; i > 0; i--) {
      const block = chain[i];

      for (const transaction of block.data) {
        if (transaction.input.address === address) {
          hasConductedTransaction = true;
        }
        const addressOutput = transaction.outputMap[address];

        if (addressOutput) {
          outputsTotal += addressOutput;
        }
      }
      if (hasConductedTransaction) {
        break;
      }
    }

    return hasConductedTransaction
      ? outputsTotal
      : STARTING_BALANCE + outputsTotal;
  }

  /**
   * Signs the provided data using the wallet's key pair.
   * @param {any} data - The data to be signed.
   * @returns {Object} The signature object.
   */
  sign(data) {
    // Best practice to sign data that has been hashed
    return this.keyPair.sign(cryptoHash(data));
  }

  /**
   * Creates a new transaction from the wallet to the recipient with the specified amount.
   * @param {Object} params - The parameters for creating a transaction.
   * @param {string} params.recipient - The recipient's wallet address.
   * @param {number} params.amount - The amount to be sent in the transaction.
   * @param {Array} params.chain - The blockchain (optional).
   * @returns {Transaction} The created transaction.
   * @throws {Error} If the amount exceeds the wallet's balance.
   */
  createTransaction({ recipient, amount, chain }) {
    if (chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey,
      });
    }
    if (amount > this.balance) {
      throw new Error("Amount exceeds balance");
    }

    return new Transaction({ senderWallet: this, recipient, amount });
  }
}

module.exports = Wallet;
