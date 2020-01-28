import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { POLL_INTERVAL_MS } from '../../../config';

class Blocks extends Component {

    state = { blocks : [] };
    
    componentDidMount() {
        this.fetchBlocks();
        this.fetchBlocksInterval = setInterval(
            () => this.fetchBlocks(),
            POLL_INTERVAL_MS
        )
    }

    componentWillUnmount() {
        clearInterval(this.fetchBlocksInterval);
    }

    fetchBlocks = () => {
        return (
            fetch(`${document.location.origin}/api/blocks`)
            .then((response) => response.json())
            .then((json) => this.setState({ blocks : json.reverse() }))
        )
    }

    render() {
        return (
            <div>
                <div className='Links'><Link to='/'>Home</Link></div>
                <h3>Blocks</h3>

                <Table bordered className="table">
                    <thead>
                      <tr>
                        <th>Block #</th>
                        <th>Timestamp</th>
                        <th>Hash</th>
                        <th>Added by</th>
                        <th>Difficulty</th>
                        <th>Nonce</th>
                      </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.blocks.map((block) => {
                            const   { 
                                blockNumber, hash, timestamp, difficulty, nonce, addedBy 
                                    }    = block;

                                const DisplayAddedBy = addedBy.length > 32 ? addedBy.substring(0,32).concat('...') : addedBy;
                                return (
                                <tr key={block.hash}>
                                    <td><Link to={`/block-data:${blockNumber}`}>{blockNumber}</Link></td>
                                    <td>{ ((Date.now() - (new Date(timestamp)))/1000).toFixed(0)} sec ago</td>
                                    <td>{hash.substring(0,32)}...</td>
                                    <td>{DisplayAddedBy}</td>
                                    <td>{difficulty}</td>
                                    <td>{nonce}</td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default Blocks;