import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
import { POLL_INTERVAL_MS } from '../../../config';

class Blocks extends Component {

    state = { blocks : [], length : 0, paginatedId : 1 };
    
    componentDidMount() {

        fetch(`${document.location.origin}/api/blocks/length`)
            .then((response) => response.json())
            .then((json) => this.setState({ length : json }))

        this.fetchPaginatedBlocks(this.state.paginatedId);

        this.fetchBlocksInterval = setInterval(
            () => this.fetchPaginatedBlocks(this.state.paginatedId),
            POLL_INTERVAL_MS
        )
    }

    componentWillUnmount() {
        clearInterval(this.fetchBlocksInterval);
    }

    fetchPaginatedBlocks = (paginatedId) => {
        return (
            fetch(`${document.location.origin}/api/blocks/${paginatedId}`)
            .then((response) => response.json())
            .then((json) => this.setState({ blocks : json }))
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

                <div >
                    {
                        [...Array(Math.ceil(this.state.length/5)).keys()].map((key) => {
                            const paginatedId = key + 1;

                            return (
                            <span key={key} className='Pagination'>
                                <Button  variant='danger' size='sm' onClick={() => this.fetchPaginatedBlocks(paginatedId)}>{paginatedId}</Button>
                            </span>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

export default Blocks;