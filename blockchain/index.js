const Block             = require('./block');
const { cryptoHash }    = require('../util');

class Blockchain {

    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({addedBy, data}) {
        const newBlock = Block.mineBlock({lastBlock : this.chain[this.chain.length - 1], data, blockNumber: this.chain.length + 1, addedBy});
        this.chain.push(newBlock);
        this.chain[this.chain.length - 1];
    }

    static isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false;
        } 
        else {
            for (let i = 1; i < chain.length; i++) {
                const { timestamp, addedBy, data, blockNumber, lastHash, hash, difficulty, nonce } = chain[i];
                const lastBlock = chain[i-1];

                if(Math.abs(lastBlock.difficulty - difficulty) > 1){
                    return false;
                }

                if(lastHash !== lastBlock.hash) {
                    return false;
                } 
                else if(cryptoHash(
                            timestamp,
                            addedBy,
                            data,
                            blockNumber,
                            lastHash,
                            difficulty,
                            nonce
                        ) !== hash) {
                    return false;
                }
            }
            return true;
        }
    }

    replaceChain(newChain) {
        if(newChain.length <= this.chain.length) {
            console.error("incoming chain must be longer than existing chain");
            return;
        }
        else if(!Blockchain.isValidChain(newChain)) {
            console.error("incoming chain is invalid. hence, can not be replaced");
            return;
        }

        console.log("existing chain is replaced with incoming chain", newChain);
        this.chain = newChain;       
    }
}

module.exports = Blockchain;