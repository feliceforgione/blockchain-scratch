/**
 * The time rate (in milliseconds) at which new blocks are mined.
 * @type {number}
 */
const MINE_RATE = 1000;

/**
 * The initial difficulty level for mining blocks.
 * @type {number}
 */
const INITIAL_DIFFICULTY = 3;

/**
 * The genesis block data.
 * @type {Object}
 * @property {string} timestamp - The timestamp of the genesis block.
 * @property {string} hash - The hash of the genesis block.
 * @property {string} lastHash - The hash of the previous block.
 * @property {Array} data - The data stored in the genesis block.
 * @property {number} nonce - The nonce value of the genesis block.
 * @property {number} difficulty - The difficulty level of mining the genesis block.
 */
const GENESIS_DATA = {
  timestamp: "1",
  hash: "hash-one",
  lastHash: "-----",
  data: [],
  nonce: 0,
  difficulty: INITIAL_DIFFICULTY,
};

/**
 * The starting balance for a user's account.
 * @type {number}
 */
const STARTING_BALANCE = 1000;

/**
 * The reward input for the miner.
 * @type {Object}
 * @property {string} address - The authorized reward address for the miner.
 */
const REWARD_INPUT = {
  address: "*authorized-reward*",
};

/**
 * The mining reward given to the miner for successfully mining a block.
 * @type {number}
 */
const MINING_REWARD = 50;

module.exports = {
  GENESIS_DATA,
  MINE_RATE,
  STARTING_BALANCE,
  REWARD_INPUT,
  MINING_REWARD,
};
