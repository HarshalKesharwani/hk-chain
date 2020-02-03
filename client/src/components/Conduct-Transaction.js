import React, { Component } from 'react';
import { FormGroup, FormControl, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';
import { thisExpression } from '@babel/types';

class ConductTransaction extends Component {
    state   = { recipient : '', amount: 0, peers : [] };

    componentDidMount() {
        fetch(`${document.location.origin}/api/peers`)
        .then((response) => response.json())
        .then((json) => {
            this.setState({ peers : json });
        });
        
    }
    
    updateRecipient = (event) => {
        console.log("event ", event.target.value);
        this.setState({ recipient : event.target.value });
    }

    updateAmount = (event) => {
        this.setState({ amount : Number(event.target.value) });
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        fetch(`${document.location.origin}/api/transact`, {
            method : 'POST',
            headers : { 'Content-Type' : 'application/json' },
            body : JSON.stringify({ recipient, amount })
        })
        .then(response => response.json())
        .then(json => {
            alert(json.message || json.type);
            history.push('/transaction-pool');
        });
    }

    render() {
        return (
            <div>
                <div className='Links'><Link to='/'>Home</Link></div>
                <h3>Conduct a transaction</h3>
                <div className='ConductTransaction'>
                    <FormGroup>
                        <Form.Label>Recipient :</Form.Label>
                        <Form.Control as="select" value={this.state.recipient} onChange={this.updateRecipient}>
                            <option>Select Address</option>
                            {
                                this.state.peers.map((peer) => {
                                    return (<option key={peer}>{peer}</option>)
                                })
                            }
                        </Form.Control>
                    </FormGroup>            
                    <FormGroup>
                        Amount :
                        <FormControl input='number' placeholder='amount' value={this.state.amount} onChange={this.updateAmount}></FormControl>
                    </FormGroup>
                    <Button variant='danger' onClick={this.conductTransaction}>Submit</Button>
                </div>
            </div>
        )
    }
}

export default ConductTransaction;