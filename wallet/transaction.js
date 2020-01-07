const uuid                      = require('uuid/v1');
const { VerifySignature }       = require('../util');
const   { 
            MINING_INPUT, 
            MINING_REWARD 
        }                       = require('../config');
class Transaction {

    //constructor
    constructor({ senderWallet, recipient, amount, outputMap, input }) {
        this.id                 = uuid();
        this.outputMap          = outputMap || this.createOutputMap({ 
                                            senderWallet, 
                                            recipient, 
                                            amount 
                                        });
        this.input              = input || this.createInput({ 
                                            senderWallet,
                                            outputMap: this.outputMap 
                                        });
    }

    //create output map
    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap                     = {};
        outputMap[recipient]                = amount;
        outputMap[senderWallet.publicKey]   = senderWallet.balance - amount;
        return outputMap;
    }

    //create inputs
    createInput({ senderWallet, outputMap }) {
        const input     = {
            timestamp   : Date.now(),
            address     : senderWallet.publicKey,
            amount      : senderWallet.balance,
            signature   : senderWallet.sign(outputMap)
        };
        return input;
    }

    //validate transactions
    static validateTransaction(transaction) {
        const   {
                    input : {
                        address,
                        amount,
                        signature
                    },
                    outputMap
                }           = transaction;
            
        const totalAmount   = Object.values(outputMap)
                                .reduce((total, amount) => total+amount);

        if(totalAmount !== amount) {
            console.log(JSON.stringify(outputMap));
            console.error(`Invalid outputMap from : ${address} :: ${totalAmount} :: ${amount}`);
            return false;
        }

        if(!VerifySignature({
            publicKey   : address,
            data        : outputMap,
            signature
        })) {
            console.error(`Invalid signature from : ${address}`);
            return false;
        }

        return true;
    }

    //update existing transaction
    updateTransaction({ senderWallet, recipient, amount }) {
        if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error("Insufficient balance");
        }
        console.log("recipient "+this.outputMap[recipient]);
        
        if(this.outputMap[recipient] === undefined) {
            this.outputMap[recipient] = amount; 
        }
        else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }

        this.outputMap[senderWallet.publicKey]  = this.outputMap[senderWallet.publicKey] - amount;
        this.input                              = this.createInput({
                                                        senderWallet,
                                                        outputMap   : this.outputMap 
                                                    });
        return this;
    }

    //reward miner with currency
    static rewardTransaction({ minerWallet }) {
        return new Transaction({
            input       :    MINING_INPUT,
            outputMap   :   { [minerWallet.publicKey] : MINING_REWARD }
        });        
    }
}

module.exports  = Transaction;