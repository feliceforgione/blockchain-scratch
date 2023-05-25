require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");
const Blockchain = require("./src/blockchain");
const PubSub = require("./src/app/pubsub");
const TransactionPool = require("./src/wallet/transaction-pool");
const Wallet = require("./src/wallet");
const TransactionMiner = require("./src/app/transaction-miner");
const seedData = require("./src/seedData");

const isDevelopment = process.env.ENV === "development";
const REDIS_URL = isDevelopment ? process.env.REDIS_URL : "";

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, redisURL: REDIS_URL });
const transactionMiner = new TransactionMiner({
  blockchain,
  transactionPool,
  wallet,
  pubsub,
});

const DEFAULT_PORT = Number(process.env.PORT);
const ROOT_NODE_ADDRESS = `${process.env.HOST}:${DEFAULT_PORT}`;

app.use(express.json());
app.use(express.static(path.join(__dirname, "./client/dist")));

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.get("/api/blocks/:page", (req, res) => {
  const pageSize = 5;
  const { page } = req.params;
  const { length } = blockchain.chain;

  const blocksReversed = blockchain.chain.slice().reverse();

  let startIndex = (page - 1) * pageSize;
  let endIndex = page * pageSize;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
});

app.get("/api/validate", (req, res) => {
  const result = Blockchain.isValidChain(blockchain.chain);
  res.json({ result, chain: blockchain.chain });
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();
  res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
  const { amount, recipient } = req.body;
  let transaction = transactionPool.existingTransaction({
    inputAddress: wallet.publicKey,
  });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain,
      });
    }
  } catch (error) {
    return res.status(400).json({ type: "error", message: error.message });
  }
  transactionPool.setTransaction(transaction);
  pubsub.broadcastTransaction(transaction);

  return res.json({ type: "success", transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transactions", (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect("/api/blocks");
});

app.get("/api/wallet-info", (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({
      chain: blockchain.chain,
      address,
    }),
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});

function syncChains() {
  axios
    .get(`${ROOT_NODE_ADDRESS}/api/blocks`)
    .then((response) => {
      const rootChain = response.data;
      console.log("replace chain on a sync with", rootChain);

      blockchain.replaceChain(rootChain);
    })
    .catch((error) => {
      console.log(error);
    });
}

function syncTransactionPool() {
  axios
    .get(`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`)
    .then((response) => {
      const rootTransactionPoolMap = response.data;
      console.log(
        "replace transaction pool map on a sync with",
        rootTransactionPoolMap
      );

      transactionPool.setMap(rootTransactionPoolMap);
    })
    .catch((error) => {
      console.log(error);
    });
}

// seed data only used in development
if (isDevelopment) {
  seedData({
    wallet,
    blockchain,
    transactionPool,
    transactionMiner,
  });
}

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`Server is up: ${process.env.HOST}:${PORT}`);
  if (PORT === PEER_PORT) {
    syncChains();
    syncTransactionPool();
  }
});
