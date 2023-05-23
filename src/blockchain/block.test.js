const hexToBinary = require("hex-to-binary");
const Block = require("./block.js");
const { GENESIS_DATA, MINE_RATE } = require("../config.js");
const { cryptoHash } = require("../util/");

describe("Block", () => {
  const timestamp = 2000;
  const lastHash = "foo-lasthash";
  const hash = "foo-hash";
  const data = "foo-data";
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty,
  });

  it("is a Block instance", () => {
    expect(block).toBeInstanceOf(Block);
  });
  it("has a timestamp property", () => {
    expect(block.timestamp).toEqual(timestamp);
  });
  it("has a lastHash property", () => {
    expect(block.lastHash).toEqual(lastHash);
  });
  it("has a hash property", () => {
    expect(block.hash).toEqual(hash);
  });
  it("has a data property", () => {
    expect(block.data).toEqual(data);
  });
  it("has a nonce property", () => {
    expect(block.nonce).toEqual(nonce);
  });
  it("has a difficulty property", () => {
    expect(block.difficulty).toEqual(difficulty);
  });

  describe("genesis()", () => {
    const genesisBlock = Block.genesis();
    it("returns a Block instance", () => {
      expect(genesisBlock).toBeInstanceOf(Block);
    });
    it("returns the genesis data", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe("mineBlock()", () => {
    const lastBlock = Block.genesis();
    const data = "newData";
    const minedBlock = Block.mineBlock({ lastBlock, data });
    it("returns a Block instance", () => {
      expect(minedBlock).toBeInstanceOf(Block);
    });
    it("lastHash to equal hash of last block", () => {
      expect(minedBlock.lastHash).toBe(lastBlock.hash);
    });
    it("timestamp is not undefined", () => {
      expect(minedBlock.timestamp).not.toBe(undefined);
    });
    it("data is set to the new data", () => {
      expect(minedBlock.data).toEqual(data);
    });
    it("creates  a SHA-256  hash based on the proper inputs", () => {
      expect(minedBlock.hash).toBe(
        cryptoHash(
          minedBlock.timestamp,
          lastBlock.hash,
          data,
          minedBlock.nonce,
          minedBlock.difficulty
        )
      );
    });
    it("sets a hash that matches the difficulty criteria", () => {
      expect(
        hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)
      ).toBe("0".repeat(minedBlock.difficulty));
    });
    it("it adjusts the difficulty by 1", () => {
      const acceptableDifficulty = [
        lastBlock.difficulty + 1,
        lastBlock.difficulty - 1,
      ];
      expect(acceptableDifficulty.includes(minedBlock.difficulty)).toBe(true);
    });
  });

  describe("adjustDifficulty()", () => {
    it("raises the difficulty for a quickly minded block", () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE - 100,
        })
      ).toEqual(block.difficulty + 1);
    });
    it("lowers the difficulty for a slowly minded block", () => {
      expect(
        Block.adjustDifficulty({
          originalBlock: block,
          timestamp: block.timestamp + MINE_RATE + 100,
        })
      ).toEqual(block.difficulty - 1);
    });
    it("has a lower limit of 1", () => {
      block.difficulty = -1;
      expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
    });
  });
});
