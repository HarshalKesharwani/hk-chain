const express       = require('express');
const bodyParser    = require('body-parser');
const request       = require('request');
const Blockchain    = require('./blockchain');
const Wallet        = require('./wallet');
const PubSub        = require('./app/pubSub');
const transaction   = require('./wallet/transaction');
const TransactionPool   = require('./wallet/transaction-pool');  
const TransactionMiner  = require('./app/transaction-miner'); 
const transactionPool   = new TransactionPool();  
const   { 
            DEFAULT_PORT, CHANNEL_BLOCKCHAIN, ROOT_NODE_ADDRESS
        }           = require('./config');

const blockchain    = new Blockchain();
const wallet        = new Wallet();
const pubSub        = new PubSub({ blockchain, transactionPool });

setTimeout( ()      =>pubSub.publish({ 
                                channel: CHANNEL_BLOCKCHAIN, message: blockchain.chain
                    }), 1000);

const transactionMiner  = new TransactionMiner({
    transactionPool, blockchain, pubSub, wallet
});

const app   = express();
app.use(bodyParser.json());

app.get("/api/blocks", (req, res)   => {
    res.json(blockchain.chain);
});

app.post("/api/mine", (req, res)    => {
    const { data, addedBy }     = req.body;
    blockchain.addBlock({ data, addedBy });
    pubSub.broadcastChain(blockchain.chain);
    res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
    const { recipient, amount } = req.body;
    let transaction = transactionPool.existingTransaction({ inputAddress    : wallet.publicKey });
    
    try {
        console.log("transaction "+transaction);
        if(transaction !== undefined) {
            console.log("exist");
            transaction.updateTransaction({ 
                            senderWallet    : wallet,
                            recipient,
                            amount
                        });
        } else {
            console.log("not exist");
            transaction         = wallet.createTransaction({  
                recipient,
                amount,
                chain : blockchain.chain
            });
        }
    }catch(error) {
        return res.status(400).json({ type : 'error', message : error.message });
    }
    transactionPool.setTransaction(transaction);
    pubSub.broadcastTransaction(transaction);
    res.json({ type : 'success',transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transaction", (req, res) => {
    transactionMiner.mineTransactions();
    res.redirect("/api/blocks");
});

app.get("/api/wallet-info", (req, res) => {
    const address = wallet.publicKey;
    res.json({
        address,
        balance : Wallet.calculateBalance({ 
            address,
            chain : blockchain.chain
        })
    });
});

const syncWithRootState = ()                => {
    request(`${ROOT_NODE_ADDRESS}/api/blocks`, (error, response, body)   => {
        if(!error && response.statusCode === 200) {
            const responseChain = JSON.parse(body);
            blockchain.replaceChain(responseChain);
        }
    });

    request(`${ROOT_NODE_ADDRESS}/api/transaction-pool-map`, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const transactionMap =  JSON.parse(body);
            console.log(`Transaction map synced on startup`, transactionMap);
            transactionPool.setMap(transactionMap);
        }
    });
}

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT   = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT      = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, ()                 => {
    console.log(`listening to port ${PORT}`);
    if(PORT     !== DEFAULT_PORT)
    syncWithRootState();
});
