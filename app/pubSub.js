const redis         = require('redis');
const Blockchain    = require('../blockchain');
const { CHANNELS }  = require('../config');

class PubSub {

    //constructor
    constructor({ blockchain }) {

        this.Blockchain = blockchain;
        
        this.publisher  = redis.createClient();
        this.subscriber = redis.createClient();

        //this.subscriber.subscribe(CHANNELS.TEST);
        //this.subscriber.subscribe(Object.values(CHANNELS).toString());
        this.subscribe();

        this.subscriber.on("message", (channel, message) => {
            this.handleMessage({ channel, message });
        });
    }

    handleMessage({ channel, message }) {
        console.log(`Message received. Channel: ${channel}. Message: ${message}.`);
        const parseMessage  = JSON.parse(message);
        this.Blockchain.replaceChain(parseMessage);
    }

    subscribe() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel); 
        });
    }
    
    publish({ channel, message  }) {
        this.subscriber.unsubscribe(CHANNELS.BLOCKCHAIN, () => {
            this.publisher.publish(channel, JSON.stringify(message), () => {
                this.subscriber.subscribe(CHANNELS.BLOCKCHAIN);
            });
        });
    }
}

module.exports      = PubSub; 
// const testPubSub = new PubSub();
// setTimeout( () => testPubSub.publisher.publish(CHANNELS.TEST, 'testing of pubsub on redis'), 1000); 
