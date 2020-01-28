const Wallet            = require('./index');
const Transaction       = require('./transaction');
const Blockchain        = require('../blockchain');
const { VerifySignature }   = require('../util');
const { STARTING_BALANCE }  = require('../config');

describe("Wallet", ()                           => {
    let wallet, recipient, amount;;
    
    beforeEach(()                               => {
        let logMock = jest.fn();
        global.console.log  = logMock;
        wallet              = new Wallet();
        recipient           = 'dummy recipient';
        amount              = 99;
    });

    it("has a `balance`", ()                    => {
        expect(wallet).toHaveProperty('balance');
    });

    it("has a `publicKey`", ()                  => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe("Verify Signature", ()             => {
        let data    = "sample data";
        it("verifies valid signature", ()       => {
            expect(
                VerifySignature({
                publicKey : wallet.publicKey,
                signature : wallet.sign(data),
                data 
                })
            ).toBe(true);
        });

        it("Invalid signature not verified", ()       => {
            expect(
                VerifySignature({
                publicKey : wallet.publicKey,
                data,
                signature : new Wallet().sign(data) 
                })
            ).toBe(false);
        });
    });

    describe("Create Transaction", ()           => {
        let transaction;
        beforeEach(()                           => {
            transaction   = wallet.createTransaction({ recipient, amount, chain : new Blockchain().chain });
        });

        it("should have instance of transaction object",
                                            ()  => {
            expect(transaction instanceof Transaction).toBe(true);
        });

        it("should have valid sender", ()       => {
            expect(transaction.input.address).toEqual(wallet.publicKey);
        });

        it("should update recipient balance", ()=> {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it("calculates balance before each transaction", () => {
            let calculateBalanceMock        = jest.fn();
            const originalCalculateBalance  = Wallet.calculateBalance;
            Wallet.calculateBalance         = calculateBalanceMock;

            wallet.createTransaction({
                recipient,
                amount,
                chain : new Blockchain().chain
            })
            expect(calculateBalanceMock).toHaveBeenCalled();
            Wallet.calculateBalance = originalCalculateBalance;
        });
    });

    describe("calculateBalance()", () => {
        let blockchain;
        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe("no transaction", () => {
            it("returns `STARTING_BALANCE` as transaction history is not found", () => {
                expect(
                    Wallet.calculateBalance({
                        chain : blockchain.chain, address : wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE);
            });
        });

        describe("has transactions", () => {
            let transactionOne, transactionTwo;
            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient : wallet.publicKey, amount : 50, chain : blockchain.chain 
                });

                transactionTwo = new Wallet().createTransaction({
                    recipient : wallet.publicKey, amount : 30 , chain : blockchain.chain
                });

                blockchain.addBlock({ addedBy: 'miner', data : [ transactionOne, transactionTwo] });
                
            });

            it("outputs calculated balance", () => {
                expect(
                    Wallet.calculateBalance({
                        chain : blockchain.chain, address : wallet.publicKey
                    })
                ).toEqual(
                    STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                )
            });
        });

        describe("balance of recent transaction", () => {
            let recentTransaction;
            beforeEach(() => {
                recentTransaction = wallet.createTransaction({
                    recipient,
                    amount,
                    chain : blockchain.chain
                });

                blockchain.addBlock({
                    addedBy : 'miner',
                    data    : [recentTransaction]
                });
            });

            it("returns the amount of recent transaction", () => {
                expect(
                    Wallet.calculateBalance({
                        chain : blockchain.chain,
                        address : wallet.publicKey
                    })
                ).toEqual(recentTransaction.outputMap[wallet.publicKey])
            });

            describe(" there are outputs next to and after the recent transaction", () => {
                let sameBlockTransaction, nextBlockTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient   : 'next-foo-recipient',
                        amount      : 60,
                        chain       : blockchain.chain
                    });

                    sameBlockTransaction = Transaction.rewardTransaction({ minerWallet : wallet });
                    blockchain.addBlock({
                        addedBy : 'miner',
                        data    : [recentTransaction, sameBlockTransaction]
                    });
                    nextBlockTransaction = new Wallet().createTransaction({
                        recipient   : wallet.publicKey,
                        amount      : 75,
                        chain       : blockchain.chain
                    });
                    blockchain.addBlock({
                        addedBy : 'miner',
                        data    : [nextBlockTransaction] 
                    });
                });

                it(" outputs amounts in the returned balance", () => {
                    expect(
                        Wallet.calculateBalance({
                            chain   : blockchain.chain,
                            address : wallet.publicKey 
                        })
                    ).toEqual(
                        recentTransaction.outputMap[wallet.publicKey] +
                        sameBlockTransaction.outputMap[wallet.publicKey] +
                        nextBlockTransaction.outputMap[wallet.publicKey]
                    );
                });
            });
        });
    });
});