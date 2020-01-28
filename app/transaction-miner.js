const Transaction   = require('../wallet/transaction');

class TransactionMiner {

    //constructor
    constructor({ blockchain, pubSub, transactionPool, wallet }) {
        this.blockchain         =   blockchain;
        this.pubSub             =   pubSub;
        this.transactionPool    =   transactionPool;
        this.wallet             =   wallet;
    }

    // validate transactions and mine a new block
    mineTransactions() {
        // add valid transactions
        const validTransactions = this.transactionPool.validTransaction();
        console.log('validTransactions',validTransactions);
        if(validTransactions.length != 0) {
            // reward miners
            const rewardTransaction = Transaction.rewardTransaction({ minerWallet : this.wallet });
            validTransactions.push(rewardTransaction);

            // add block to chain
            this.blockchain.addBlock({ addedBy : this.wallet.publicKey, data : validTransactions});

            // broadcast chain
            this.pubSub.broadcastChain();

            // clear transactionMap
            this.transactionPool.clear();
        }
        else {
            throw new Error("Nothing to mine");
        }
    }
}

module.exports= TransactionMiner;