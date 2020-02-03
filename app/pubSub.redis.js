const redis         = require('redis');
const Blockchain    = require('../blockchain');
const   { 
            CHANNELS,
            CHANNEL_BLOCKCHAIN
        }           = require('../config');

class PubSub {

    //constructor
    constructor({ blockchain, transactionPool }) {

        this.Blockchain         =   blockchain;
        this.transactionPool    =   transactionPool;

        this.publisher  = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribe();

        this.subscriber.on("message", (channel, message) => {
            this.handleMessage({ channel, message });
        });
    }

    // handle received message
    handleMessage({ channel, message }) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parseMessage  = JSON.parse(message);
        switch(channel) {

            case CHANNELS.BLOCKCHAIN:
                this.Blockchain.replaceChain(parseMessage,true, () => {
                    console.log('Replace chain message : ', message);
                    this.transactionPool.clearBlockchainTransaction({ chain : parseMessage });
                });
                break;

            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parseMessage);
                break;

            default:
                return;
        }
    }

    // subscribe to all available channels
    subscribe() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel); 
        });
    }
    
    //publish messages over specific channels
    publish({ channel, message  }) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, JSON.stringify(message), () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    // broadcast own copy to blockchain to the network
    broadcastChain() {
        this.publish({ channel: CHANNEL_BLOCKCHAIN, message: this.Blockchain.chain });
    }

    // broadcast transaction to peers
    broadcastTransaction(transaction) {
        this.publish({ 
            channel: CHANNELS.TRANSACTION, message: transaction
        });
    }
}

module.exports      = PubSub; 