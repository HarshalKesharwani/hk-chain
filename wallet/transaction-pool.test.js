const TransactionPool       = require('./transaction-pool');
const Transaction           = require('./transaction');
const Wallet                = require('./index');

describe("TransactionPool", () => {
    let transactionPool, transaction, recipient, amount;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        recipient       = 'foo-recipient';
        amount          = 50;
        transaction     = new Transaction({
            senderWallet: new Wallet(),
            recipient,
            amount
        });  
    });

    describe("TransactionPool()", () => {
        it("should set Transaction", () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });

    });
});