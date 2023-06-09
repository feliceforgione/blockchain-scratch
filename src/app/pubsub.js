const redis = require("redis");

/**
 * Represents available channels.
 * @enum {string}
 */
const CHANNELS = {
  TEST: "TEST",
  BLOCKCHAIN: "BLOCKCHAIN",
  TRANSACTION: "TRANSACTION",
};

/**
 * Represents the PubSub class.
 */
class PubSub {
  /**
   * Creates an instance of PubSub.
   * @param {object} options - The options for PubSub.
   * @param {Blockchain} options.blockchain - The blockchain instance.
   * @param {TransactionPool} options.transactionPool - The transaction pool instance.
   * @param {string} options.redisURL - The URL for the Redis server.
   */
  constructor({ blockchain, transactionPool, redisURL }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.publisher = redis.createClient(redisURL);
    this.subscriber = redis.createClient(redisURL);

    this.initalize();
  }

  /**
   * Initializes the PubSub instance by connecting and subscribing to channels.
   * @returns {Promise<void>}
   */
  async initalize() {
    await this.publisher.connect();
    await this.subscriber.connect();
    await this.subscribeToChannels();
  }

  /**
   * Subscribes to all channels.
   * @returns {Promise<void>}
   */
  subscribeToChannels = async () => {
    // await this.subscriber.subscribe("BLOCKCHAIN", this.handleMessage);
    Object.values(CHANNELS).forEach(async (channel) =>
      this.subscriber.subscribe(channel, this.handleMessage)
    );
  };

  /**
   * Handles the received message on a channel.
   * @param {string} message - The received message.
   * @param {string} channel - The channel on which the message was received.
   */
  handleMessage = (message, channel) => {
    console.log(`Message recieved. Channel: ${channel}.  Message: ${message}.`);

    const parsedMessage = JSON.parse(message);
    const onSuccess = () => {
      this.transactionPool.clearBlockchainTransactions({
        chain: parsedMessage,
      });
    };
    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
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

  /**
   * Publishes a message to the specified channel.
   * @param {object} options - The options for publishing a message.
   * @param {string} options.channel - The channel to publish the message to.
   * @param {string} options.message - The message to publish.
   * @returns {Promise<void>}
   */
  async publish({ channel, message }) {
    await this.subscriber.unsubscribe(channel);
    await this.publisher.publish(channel, message);
    await this.subscriber.subscribe(channel, this.handleMessage);
  }

  /**
   * Broadcasts the current blockchain to all subscribers.
   */
  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain),
    });
  }

  /**
   * Broadcasts a transaction to all subscribers.
   * @param {Transaction} transaction - The transaction to broadcast.
   */
  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction),
    });
  }
}

module.exports = PubSub;
