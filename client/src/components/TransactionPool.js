import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Transaction from './Transaction';
import { Button, Table } from 'react-bootstrap';
import history from '../history';
import { POLL_INTERVAL_MS } from '../../../config';

class TransactionPool extends Component {

    state = { transcationPoolMap : [] };

    fetchTranscationPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response => response.json())
        .then(json => this.setState({ transcationPoolMap : json }));
    };

    componentDidMount() {
        this.fetchTranscationPoolMap();

        this.fetchTranscationPoolMapInterval = setInterval(
            () => this.fetchTranscationPoolMap(),
            POLL_INTERVAL_MS
        )
    }

    componentWillUnmount() {
        clearInterval(this.fetchTranscationPoolMapInterval);
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transaction`)
        .then(response => {
            if(response.status === 200) {
                alert('success')
                history.push('/blocks');
            }
            else {
                response.json()
                .then(json => alert(`Mining failed. ${json.message}.`))
            }
        })
    }

    render() {
        return (
            <div className='TransactionPool'>
                <div className='Links'><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                <Table bordered className='table'>
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>     
                    {    
                        Object.values(this.state.transcationPoolMap).map((transaction) => {
                        return (
                                <Transaction key={transaction.id} transaction={transaction}></Transaction>
                            )
                        })
                    }
                    </tbody>
                </Table>
                <Button variant='danger' onClick={this.fetchMineTransactions}>Mine the transactions</Button>
            </div>
       ) 
    }
}

export default TransactionPool;