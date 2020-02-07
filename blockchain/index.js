const Block             = require('./block');
const { cryptoHash }    = require('../util');
const Transaction       = require('../wallet/transaction');
const Wallet            = require('../wallet');
const   {
            MINING_INPUT,
            MINING_REWARD
        }               = require('../config');
class Blockchain {

    //constructor
    constructor() {
        this.chain      = [Block.genesis()];
    }

    //add block in a blockchain
    addBlock({addedBy, data}) {
        const newBlock = Block.mineBlock({lastBlock : this.chain[this.chain.length - 1], data, blockNumber: this.chain.length + 1, addedBy});
        this.chain.push(newBlock);
        //this.chain[this.chain.length - 1];
    }

    //replace current chain with new most updated valid chain
    replaceChain(newChain, validateTransaction, onSuccess) {  
        if(newChain.length <= this.chain.length) {
            console.error("incoming chain must be longer than existing chain");
            return;
        }
        else if(!Blockchain.isValidChain(newChain)) {
            console.error("incoming chain is invalid. hence, can not be replaced");
            return;
        }

        if(validateTransaction && !this.isValidTransactionData({newChain})) {
            console.error("transaction data is invalid");
            return;
        }
        
        if(onSuccess) {
            onSuccess();
        }

        this.chain = newChain;       
    }

    //validate transaction data in the chain
    isValidTransactionData({ newChain }) {
        console.log("newChain : ", newChain.length);
        for(let i=1; i< newChain.length; i++) {
            const block     = newChain[i];
            const transactionSet  = new Set();
            let rewardTransactionCount  = 0;
            for(let transaction of block.data) {
                if(transaction.input.address == MINING_INPUT.address) {
                    rewardTransactionCount += 1;

                    if(rewardTransactionCount > 1) {
                        console.error("Multiple reward transactions found");
                        return false;
                    }
                    
                    if(Object.values(transaction.outputMap)[0]  !== MINING_REWARD) {
                        console.error("Invalid Reward");
                        return false;
                    }
                }
                else {
                    if(!Transaction.validateTransaction(transaction)) {
                        console.error("Invalid transaction");
                        return false;
                    }
                    const trueBalance   = Wallet.calculateBalance({
                        chain   : this.chain,
                        address : transaction.input.address,
                        timestamp :  transaction.input.timestamp
                    });
                    
                    if(transaction.input.amount !== trueBalance) {
                        console.error(`Evil Transaction : Balance doesn't match blockchain history`);
                        return false;
                    }

                    if(transactionSet.has(transaction)) {
                        console.error("Duplicate transactions found");
                        return false;
                    }
                    else {
                        transactionSet.add(transaction);
                    }
                }
            }
        }
        return true;
    }

    //validate chain
    static isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            console.log("genesis not matching");
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
                else if(
                cryptoHash(timestamp, addedBy, data, blockNumber, lastHash, difficulty, nonce) !== hash) {
                    return false;
                }
            }
            return true;
        }
    }

}

module.exports = Blockchain;