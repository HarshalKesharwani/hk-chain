const Transaction   = require('./transaction');

class TransactionPool {

    //constructor
    constructor() {
        this.transactionMap     = {};
    }

    //add transaction to the transaction pool
    setTransaction(transaction) {
        this.transactionMap[transaction.id] =   transaction;
    }

    //replace transaction pool
    setMap(transactionMap) {
        this.transactionMap =    transactionMap;
    }

    //check if transaction is already added in the transaction pool
    existingTransaction({ inputAddress }) {
            const transactions  = Object.values(this.transactionMap);
            return transactions.find( (transaction) => 
                transaction.input.address === inputAddress  
            );
    }

    // validate every transaction in the transaction pool
    validTransaction() {
        return Object.values(this.transactionMap)
        .filter((transaction) => {
            return Transaction.validateTransaction(transaction);
        });
    }

    //clear transaction pool
    clear() {
        this.transactionMap     = {};
    }

    //clear commited transaction from transaction pool
    clearBlockchainTransaction({ chain }) {
        for(let i=1; i<chain.length; i++) {
            const block = chain[i];
            block.data.forEach(transaction => {
                if(this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            });
        }  
        return this.transactionMap;
    }
}

module.exports  = TransactionPool;