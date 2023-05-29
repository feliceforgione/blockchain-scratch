const Transaction = require("./transaction");

/**
 * Represents a transaction pool that holds and manages transactions.
 */
class TransactionPool {
  constructor() {
    /**
     * The transaction map that holds the transactions.
     * @type {Object.<string, Transaction>}
     */
    this.transactionMap = {};
  }

  /**
   * Sets a transaction in the transaction map.
   * @param {Transaction} transaction - The transaction to be set.
   */
  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  /**
   * Sets the transaction map to a new map.
   * @param {Object.<string, Transaction>} transactionMap - The new transaction map.
   */
  setMap(transactionMap) {
    this.transactionMap = transactionMap;
  }

  /**
   * Finds an existing transaction with a specific input address.
   * @param {Object} params - The parameters for finding an existing transaction.
   * @param {string} params.inputAddress - The input address to search for.
   * @returns {Transaction|undefined} The existing transaction, if found. Otherwise, undefined.
   */
  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);

    return transactions.find(
      (transaction) => transaction.input.address === inputAddress
    );
  }

  /**
   * Retrieves the valid transactions from the transaction pool.
   * @returns {Transaction[]} The valid transactions.
   */
  validTransactions() {
    const transactions = Object.values(this.transactionMap);
    return transactions.filter((transaction) =>
      Transaction.validTransaction(transaction)
    );
  }

  /**
   * Clears the transaction pool.
   */
  clear() {
    this.transactionMap = {};
  }

  /**
   * Clears the transactions from the transaction pool that are included in the given blockchain.
   * @param {Blockchain} params - The parameters for clearing blockchain transactions.
   * @param {Block[]} params.chain - The blockchain.
   */
  clearBlockchainTransactions({ chain }) {
    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];

      for (const transaction of block.data) {
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }
}

module.exports = TransactionPool;
