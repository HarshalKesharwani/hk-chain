class Peers {
    
    static addPeer(peer) {
        if(this.peers === undefined)
            this.peers = {};
        this.peers[peer] = peer;
    }

    static getPeers() {
        if(this.peers === undefined)
            return [];
        return Object.keys(this.peers);
    }
}

module.exports = Peers;