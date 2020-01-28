const DEFAULT_PORT          = 3000;
const ROOT_NODE_ADDRESS     = `http://localhost:${DEFAULT_PORT}`;   
const CHANNEL_BLOCKCHAIN    = "BLOCKCHAIN";
const MINING_RATE           = 50000; //milliseconds
const INITIAL_DIFFICULTY    = 6;
const STARTING_BALANCE      = 1000;
const MINING_REWARD         = 50;
const MINING_INPUT          = { timestamp: Date.now(), address : "**Authorized-Reward**" };
const POLL_INTERVAL_MS      = 1000; //milliseconds
const CHANNELS              = {
    TEST        : 'TEST',
    BLOCKCHAIN  : 'BLOCKCHAIN',
    TRANSACTION :  'TRANSACTION'
}
const GENESIS_DATA          = {
    blockNumber : 1,
    timestamp   : Date.now(),
    lastHash    : '0x0000000000000000000000000000000000000000000000000000000000000000',
    data        : [],
    hash        : '',
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
                                    MINING_INPUT,
                                    POLL_INTERVAL_MS
                                }