const PubNub        = require('pubnub');
const   { 
            CHANNELS,
            CHANNEL_BLOCKCHAIN
        }           = require('../config');
const Peers         = require('../wallet/peers');
const credentials   = {
    publishKey: 'pub-c-cd1e68a5-a662-41fb-837f-0f85f7cdf8d2',
    subscribeKey: 'sub-c-7f247e0c-41a9-11ea-8a62-3662be881406',
    secretKey: 'sec-c-YmVhYTc2OTYtNWNjMi00ZGM3LThiOTEtZTVlODI0MjdiN2U5'
};

class PubSub {

    //constructor
    constructor({ blockchain, transactionPool, wallet }) {

        this.blockchain         =   blockchain;
        this.transactionPool    =   transactionPool;
        this.wallet = wallet;
        this.pubnub = new PubNub(credentials);
        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
        this.pubnub.addListener(this.listener());
    }

    // handle received message
    listener() {
        return {
          message: messageObject => {
            const { channel, message } = messageObject;
    
            //console.log(`Message received. Channel: ${channel}. Message: ${message}`);
            const parsedMessage = JSON.parse(message);
              switch(channel) {
                case CHANNELS.BLOCKCHAIN:
                  this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransaction(
                      { chain: parsedMessage }
                    );
                  });
                  break;

                case CHANNELS.TRANSACTION:
                  if (!this.transactionPool.existingTransaction({
                      inputAddress: parsedMessage.input.address
                  })) {
                      this.transactionPool.setTransaction(parsedMessage);
                  }
                  break;

                case CHANNELS.ADDRESS:
                  Peers.addPeer(parsedMessage);  
                  break;
                  
                default:
                  return;
              }
          }
        }
      }

    // subscribe to all available channels
    subscribe() {
        Object.values(CHANNELS).forEach(channel => {
            this.pubnub.subscribe(channel); 
        });
    }
    
    //publish messages over specific channels
    publish({ channel, message  }) {
        this.pubnub.publish({ message, channel }).catch(error => {  // catch the errors
          console.log(error);
        });;
    }

    // broadcast own copy to blockchain to the network
    broadcastChain() {
      console.log("Broadcasting chain with length : ", this.blockchain.chain.length)
        this.publish({ channel: CHANNEL_BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) });
    }

    // broadcast transaction to peers
    broadcastTransaction(transaction) {
        this.publish({ 
            channel: CHANNELS.TRANSACTION, message: JSON.stringify(transaction)
        });
    }

    //broadcast own address to peers
    broadcastPublicKey() {
        this.publish({ 
          channel: CHANNELS.ADDRESS, message: JSON.stringify(this.wallet.publicKey)
        });
    } 

}

module.exports      = PubSub; 