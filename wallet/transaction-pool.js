const Transaction   = require('./transaction');
const Wallet        = require('./index');

class TransactionPool {

    //constructor
    constructor() {
        this.transactionMap     = {};
    }

    //methods
    setTransaction(transaction) {
        this.transactionMap[transaction.id] =   transaction;
    }

    existingTransaction({ inputAddress }) {
        
        const transactions  = Object.values(this.transactionMap);
        
        return transactions.find( (transaction) => 
        {
            if(transaction.input.address == inputAddress) {
                return transaction;
            }
            else {
                //do nothing
            }
        });
        return undefined;
    }
}

module.exports  = TransactionPool;