const DEFAULT_PORT          = 3000;
const ROOT_NODE_ADDRESS     = `http://localhost:${DEFAULT_PORT}`;   
const CHANNEL_BLOCKCHAIN    = "BLOCKCHAIN";
const MINING_RATE           = 50000; //milliseconds
const INITIAL_DIFFICULTY    = 3;
const STARTING_BALANCE      = 1000;
const MINING_REWARD         = 50;
const MINING_INPUT          = { address : "*Authorized-Reward*" };

const CHANNELS              = {
    TEST        : 'TEST',
    BLOCKCHAIN  : 'BLOCKCHAIN',
    TRANSACTION :  'TRANSACTION'
}
const GENESIS_DATA          = {
    blockNumber : 1,
    timestamp   : 1,
    lastHash    : 'genesis-block-has-no-last-hash' ,
    data        : [],
    hash        : 'genesis-block-hash',
    addedBy     : 'Harshal-Kesharwani',
    nonce       : 0,
    difficulty  : INITIAL_DIFFICULTY
};
module.exports              =   {
                                    GENESIS_DATA,
                                    MINING_RATE,
                                    DEFAULT_PORT,
                                    CHANNELS,
                                    CHANNEL_BLOCKCHAIN,
                                    ROOT_NODE_ADDRESS,
                                    STARTING_BALANCE,
                                    MINING_REWARD,
                                    MINING_INPUT
                                }