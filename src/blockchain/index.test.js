const Blockchain = require("./index");
const Block = require("./block");
const { cryptoHash } = require("../util");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe("Blockchain", () => {
  let blockchain;
  let newChain;
  let originalChain;
  let errorMock;
  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
    errorMock = jest.fn();

    global.console.error = errorMock;
  });
  it("chain property is an array", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it("first block is genesis block", () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it("new block has data set", () => {
    const newData = "foo";
    blockchain.addBlock({ data: newData });
    expect(blockchain.chain[blockchain.chain.length - 1].data).toBe(newData);
  });

  describe("isValidChain()", () => {
    const mockConsoleLog = jest.fn();
    console.log = mockConsoleLog;
    describe("when the chain does not start with the genesis block", () => {
      it("will return false", () => {
        blockchain.chain[0] = { data: "bad data" };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });
    describe("when the chain starts with the genesis block and has multiple blocks", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "data1" });
        blockchain.addBlock({ data: "data2" });
        blockchain.addBlock({ data: "data3" });
      });
      describe("and a lastHash reference has changed", () => {
        it("will return false", () => {
          blockchain.chain[2].lastHash = "";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain contains a block and an invalid field", () => {
        it("will return false", () => {
          blockchain.chain[2].data = "";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain contains a block with a jumed difficulty", () => {
        it("returns false", () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const nonce = 0;
          const data = [];
          const timestamp = Date.now();
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash({
            data,
            lastHash,
            nonce,
            timestamp,
            difficulty,
          });

          const badBlock = new Block({
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
          });
          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("and the chain does not contain any invalid  blocks", () => {
        it("will return true", () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });

  describe("replaceChain()", () => {
    let logMock;
    let wallet;
    let transaction;
    let rewardTransaction;
    beforeEach(() => {
      logMock = jest.fn();
      global.console.log = logMock;

      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: "foo-address",
        amount: 65,
      });
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet,
      });
    });
    describe("when the new chain is not longer", () => {
      beforeEach(() => {
        newChain.chain[0] = { data: "newchain" };

        blockchain.replaceChain(newChain);
      });
      it("should not replace the chain", () => {
        expect(blockchain.chain).toEqual(originalChain);
      });
      it("should console a error", () => {
        expect(errorMock).toBeCalled();
      });
    });
    describe("when the new chain is longer", () => {
      beforeEach(() => {
        const transaction2 = wallet.createTransaction({
          recipient: "foo-address2",
          amount: 265,
        });
        const transaction3 = wallet.createTransaction({
          recipient: "foo-address3",
          amount: 365,
        });
        newChain.addBlock({ data: [transaction] });
        newChain.addBlock({ data: [transaction2] });
        newChain.addBlock({ data: [transaction3] });
      });
      describe("and new chain is invalid", () => {
        beforeEach(() => {
          newChain.chain[1].hash = "wronghash";

          blockchain.replaceChain(newChain.chain);
        });
        it("should not replace the chain", () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
        it("should console a error", () => {
          expect(errorMock).toBeCalled();
        });
      });
      describe("and new chain is valid", () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });
        it("should replace the chain", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });
        it("should console a log", () => {
          expect(logMock).toBeCalled();
        });
      });
    });
  });

  describe("validTransactionData()", () => {
    let transaction;
    let rewardTransaction;
    let wallet;

    beforeEach(() => {
      wallet = new Wallet();
      transaction = wallet.createTransaction({
        recipient: "foo-address",
        amount: 65,
      });
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet,
      });
    });

    describe("and the transaction data is valid", () => {
      it("returns true", () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          true
        );
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe("and the transaction has multiple rewards", () => {
      it("returns false and logs an error", () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction, rewardTransaction],
        });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe("and the transaction data has at least one malformed outputMap", () => {
      describe("and the transaction is not a reward transaction", () => {
        it("returns false and logs an error", () => {
          transaction.outputMap[wallet.publicKey] = 999999;

          newChain.addBlock({ data: [transaction, rewardTransaction] });

          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });

      describe("and the transaction is a reward transaction", () => {
        it("returns false and logs an error", () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999;

          newChain.addBlock({ data: [transaction, rewardTransaction] });

          expect(
            blockchain.validTransactionData({ chain: newChain.chain })
          ).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });

    describe("and the transaction data has at least one malformed input", () => {
      it("returns false and logs an error", () => {
        wallet.balance = 9000;

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100,
        };

        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap),
          },
          outputMap: evilOutputMap,
        };

        newChain.addBlock({ data: [evilTransaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe("and a block contains multiple identical transactions", () => {
      it("returns false and logs an error", () => {
        newChain.addBlock({
          data: [transaction, transaction, transaction, rewardTransaction],
        });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(
          false
        );
        expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});
