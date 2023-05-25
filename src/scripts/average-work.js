const Blockchain = require("../blockchain");
const Block = require("../blockchain/block");

const blockchain = new Blockchain();

blockchain.addBlock({ data: "initial" });

let prevTimestamp;
let nextTimestamp;
let nextBlock;
let timeDiff;
let average;
const times = [];

for (let i = 1; i < 10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;

  nextBlock = blockchain.addBlock({ data: `block ${i}` });

  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = times.reduce((acc, time) => acc + time, 0) / times.length;

  console.log(
    `timeDiff: ${timeDiff}  difficulty: ${nextBlock.difficulty}  average : ${average}`
  );
}
