import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';

class BlockData extends Component {
    state = { block : {} };
    
    componentDidMount() {
        const { match: { params } } = this.props;
        this.fetchBlock(
            Number(params.blockNumber.substring(1,params.blockNumber.length))
        );
    }

    fetchBlock = (blockNumber) => {
        return (
            fetch(`${document.location.origin}/api/block`, {
                method : 'POST',
                headers : { 'Content-Type' : 'application/json' },
                body : JSON.stringify({ blockNumber })
            })
            .then((response) => response.json())
            .then((json) => this.setState({ block : json }))
        )
    }

    render() {
        const dataArray = this.state.block.data;
        if(dataArray === undefined) {
            return (<div></div>);
        }
        return (
            <div>
                <div className='Links'>
                    <Link to='/blocks'>Back</Link>
                    <Link to='/'>Home</Link>
                </div>
                <h3>Transactions included</h3>
                
                <Table bordered className="table">
                    <thead>
                        <tr>
                            <th>Transaction id</th>
                            <th>Timestamp</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        this.state.block.data.map((transaction) => {
                            let displayTo = '', displayFrom = '', displayAmount = '', seperateDisplayToHTML, seperateDisplayAmountHTML;
                            const { input,id, outputMap }   = transaction;
                            const recipients    = Object.keys(outputMap);

                            displayFrom   = input.address.length > 32 ? `${input.address.substring(0,32)}...` : input.address;

                            if(recipients.length !== 1) {
                                for(let i=0; i<recipients.length; i++) {
                                    if(recipients[i]   !== input.address) {
                                        let d           = recipients[i].length > 32 ? `${recipients[i].substring(0,32)}...` : recipients[i];
                                        displayTo       = displayTo + d + ",";
                                    
                                        let a           = outputMap[recipients[i]];
                                        displayAmount   = displayAmount + a + ","; 
                                    }
                                }
                                seperateDisplayToHTML       = displayTo.split(',').map((line)=><div key={line}>{line}</div>);
                                seperateDisplayAmountHTML   = displayAmount.split(',').map((line)=><div key={line}>{line}</div>);
                            }
                            else {
                                seperateDisplayToHTML     = recipients[0].length > 32 ? `${recipients[0].substring(0,32)}...` : recipients[0];
                                seperateDisplayAmountHTML = outputMap[recipients[0]];
                            }

                            return (
                                <tr key={id}>
                                    <td>{id}</td>
                                    <td>{new Date(input.timestamp).toLocaleString()}</td>
                                    <td>{displayFrom}</td>
                                    <td>{seperateDisplayToHTML}</td>
                                    <td>{seperateDisplayAmountHTML}</td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </Table>
            </div>
        )
    }
}

export default BlockData;