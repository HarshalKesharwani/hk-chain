const express       = require('express');
const bodyParser    = require('body-parser');
const request       = require('request');
const Blockchain    = require('./blockchain');
const Wallet        = require('./wallet');
const PubSub        = require('./app/pubSub');
const transaction   = require('./wallet/transaction');
const 
TransactionPool     = require('./wallet/transaction-pool');  
const   {
    DEFAULT_PORT,
    CHANNEL_BLOCKCHAIN,
    ROOT_NODE_ADDRESS
    }               = require('./config');

const blockchain    = new Blockchain();
const 
transactionPool     = new TransactionPool(); 
const wallet        = new Wallet();
const pubSub        = new PubSub({ blockchain });
setTimeout( ()      =>pubSub.publish({ 
                                channel: CHANNEL_BLOCKCHAIN, message: blockchain.chain
                    }), 1000);
const app           = express();

app.use(bodyParser.json());

app.get("/api/blocks", (req, res)   => {
    res.json(blockchain.chain);
});

app.post("/api/mine", (req, res)    => {
    const { data, addedBy }     = req.body;
    blockchain.addBlock({ data, addedBy });
    pubSub.publish({ channel: CHANNEL_BLOCKCHAIN, message: blockchain.chain });
    res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
    const { recipient, amount } = req.body;
    console.log("publickey "+wallet.publicKey);
    let transaction             = transactionPool.existingTransaction({  
                                                    inputAddress    : wallet.publicKey 
                                                });
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
                senderWallet    : wallet, recipient, amount
            });
        }
        
    }catch(error) {
        return res.status(400).json({  
                                    type : 'error', message : error.message
                                });
    }
    transactionPool.setTransaction(transaction);

    //console.log(transactionPool);
    res.json({ type : 'success',transaction });
});

app.get("/api/transaction-pool-map", (req, res) => {
    res.json(transactionPool.transactionMap);
});

const syncChain = ()                => {
    request(`${ROOT_NODE_ADDRESS}/api/blocks`, (error, response, body)   => {
        if(!error && response.statusCode === 200) {
            const responseChain = JSON.parse(body);
            blockchain.replaceChain(responseChain);
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
        syncChain();
});
