const TransactionPool       = require('./transaction-pool');
const Transaction           = require('./transaction');
const Wallet                = require('./index');
const Blockchain            = require('../blockchain');

describe("TransactionPool", () => {
    let transactionPool, senderWallet, transaction, recipient, amount, logMock;
    
    beforeEach(() => {
        logMock         = jest.fn();
        transactionPool = new TransactionPool();
        senderWallet    = new Wallet();
        recipient       = 'foo-recipient';
        amount          = 50;
        transaction     = new Transaction({
            senderWallet,
            recipient,
            amount
        });
        global.console.log  = logMock;
    });

    describe("TransactionPool()", () => {
        it("should set Transaction", () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe("ValidTransactions()", () => {
        let validTransactions, errorMock;;
        beforeEach(() => {
            errorMock               = jest.fn();
            global.console.error    = errorMock; 
            validTransactions       =    [];
            
            for (let i = 0; i < 10; i++) {
                transaction =   new Transaction({
                                    senderWallet,
                                    recipient,
                                    amount
                                });

                if(i%3 == 0) {
                    transaction.input.amount = 999999;
                }
                else if(i%3 == 1) {
                    transaction.input.signature = new Wallet().sign('false-receipient');
                }
                else {
                    validTransactions.push(transaction);
                }

                transactionPool.setTransaction(transaction);
            }
        });

        it("should send valid transations", () => {
            expect(transactionPool.validTransaction()).toEqual(validTransactions);
        });

        it("error log recorded", () => {
            transactionPool.validTransaction()
            expect(errorMock).toHaveBeenCalled();
        });
    });

    describe("clear()", () => {
        it("clears transactionMap", () => {
            transactionPool.clear();
            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe("clearBlockchainTransactions", () => {

        it("clears blockchain transactions from transaction pool", () => {
            const blockchain    = new Blockchain();            
            expectedTransactionMap  = {};

            for(let i=0; i<6; i++) {
                const transaction   = new Wallet().createTransaction({
                    recipient   : 'foo-recipient',
                    amount      : 50,
                    chain   : blockchain.chain
                });

                transactionPool.setTransaction(transaction); 
                
                if(i%2 === 0) {
                    blockchain.addBlock({ 
                        addedBy : "Harshal", data : [ transaction ]
                    });
                }
                else {
                    expectedTransactionMap[transaction.id]  = transaction;
                }
            }            
            expect(transactionPool.clearBlockchainTransaction({ chain : blockchain.chain })).toEqual(expectedTransactionMap);
        });
    });
});


