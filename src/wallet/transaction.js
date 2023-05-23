const { v4: uuidv4 } = require("uuid");
const { verifySignature } = require("../util/");
const { MINING_REWARD, REWARD_INPUT } = require("../config");

class Transaction {
  constructor({ senderWallet, recipient, amount, outputMap, input }) {
    this.id = uuidv4();
    this.outputMap =
      outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input =
      input || this.createInput({ senderWallet, outputMap: this.outputMap });
  }

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

  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap),
    };
  }

  update({ senderWallet, recipient, amount }) {
    if (amount > this.outputMap[senderWallet.publicKey]) {
      throw new Error("Amount exceeds balance");
    }

    if (!this.outputMap[recipient]) {
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      outputMap: { [minerWallet.publicKey]: MINING_REWARD },
      input: REWARD_INPUT,
    });
  }
}

module.exports = Transaction;
