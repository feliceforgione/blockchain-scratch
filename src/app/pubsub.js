const redis = require("redis");

const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

class PubSub {
  constructor({ blockchain, transactionPool }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.initalize();
  }

  async initalize() {
    await this.publisher.connect();
    await this.subscriber.connect();
    await this.subscribeToChannels();
  }

  subscribeToChannels = async () => {
    //await this.subscriber.subscribe("BLOCKCHAIN", this.handleMessage);
    Object.values(CHANNELS).forEach(
      async (channel) =>
        await this.subscriber.subscribe(channel, this.handleMessage)
    );
  };

  handleMessage = (message, channel) => {
    console.log(`Message recieved. Channel: ${channel}.  Message: ${message}.`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        const onSuccess = () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage,
          });
        };
        this.blockchain.replaceChain(parsedMessage, onSuccess);
        break;
      case CHANNELS.TRANSACTION:
        console.log("inside transaction case");
        this.transactionPool.setTransaction(parsedMessage);
        break;
      default:
        break;
    }
  };

  async publish({ channel, message }) {
    await this.subscriber.unsubscribe(channel);
    await this.publisher.publish(channel, message);
    await this.subscriber.subscribe(channel, this.handleMessage);
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;
