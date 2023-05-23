const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

const GENESIS_DATA = {
  timestamp: "1",
  hash: "hash-one",
  lastHash: "-----",
  data: [],
  nonce: 0,
  difficulty: INITIAL_DIFFICULTY,
};

const STARTING_BALANCE = 1000;

// Miner Specific consts
const REWARD_INPUT = {
  address: "*authorized-reward*",
};

const MINING_REWARD = 50;

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD,
};
