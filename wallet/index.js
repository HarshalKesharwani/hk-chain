const { STARTING_BALANCE }  = require("../config");
const { ec, cryptoHash }    = require('../util');
const Transaction           = require('./transaction');

class Wallet {

    //constructor
    constructor() {
        this.balance        = STARTING_BALANCE;
        this.keyPair        = ec.genKeyPair();
        this.publicKey      = this.keyPair.getPublic().encode("hex");
        //console.log(this.publicKey);
    }

    //sign the transaction
    sign(data) { 
        return this.keyPair.sign(cryptoHash(data));
    }

    //create transaction and add it to a transaction pool
    createTransaction({ recipient, amount, chain }) {
        
        this.balance    = Wallet.calculateBalance({ chain, address : this.publicKey });

        if(amount > this.balance) {
            throw new Error("Insufficient Balance");
        }
        return new Transaction({
                        senderWallet : this,
                        recipient,
                        amount
                    });
    }

    static calculateBalance({ chain, address }) {
        let outputTotal         = 0;
        let hasMadeTransaction  = false;
        
        for(let i = chain.length - 1; i > 0; i--) {
            const block = chain[i];

            for(let transaction of block.data) {        
                
                if(transaction.input.address === address) {
                    hasMadeTransaction = true;
                }
                
                const transactionAmt = transaction.outputMap[address];
                if(transactionAmt) {
                    outputTotal = outputTotal + transactionAmt;
                }
            }
            
            if(hasMadeTransaction) {
                break;
            }
        }
        return hasMadeTransaction ? outputTotal : STARTING_BALANCE + outputTotal;
    }
}

module.exports = Wallet;