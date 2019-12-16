const uuid                      = require('uuid/v1');
const { VerifySignature }       = require('../util');
class Transaction {

    //constructor
    constructor({ senderWallet, recipient, amount }) {
        this.id                 = uuid();
        //this.senderWallet       = senderWallet;
        //this.recipient          = recipient;
        //this.amount             = amount;
        this.outputMap          = this.createOutputMap({ 
                                            senderWallet, 
                                            recipient, 
                                            amount 
                                        });
        this.input              = this.createInput({ 
                                            senderWallet,
                                            outputMap: this.outputMap 
                                        });
    }

    //methods
    createOutputMap({ senderWallet, recipient, amount }) {
        const outputMap                     = {};
        outputMap[recipient]                = amount;
        outputMap[senderWallet.publicKey]   = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        const input                         = {
            timestamp   : Date.now(),
            address     : senderWallet.publicKey,
            amount      : senderWallet.balance,
            signature   : senderWallet.sign(outputMap)
        };
        return input;
    }

    static validateTransaction(transaction) {
        const {
                input : {
                    address,
                    amount,
                    signature
                },
                outputMap
            }               = transaction;
            
        const totalAmount   = Object.values(outputMap)
                                .reduce((total, amount) => total+amount);


        if(totalAmount != amount) {
            console.error(`Invalid outputMap from : ${address}`);
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
}

module.exports  = Transaction; 