import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_white.png';

class App extends Component {
    state   =   {   
                    walletInfo      : {}
                };

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
        .then((response) => response.json())
        .then((json) => this.setState({ walletInfo   : json }));
    }

    render() {
        const { address, balance }  = this.state.walletInfo;
        return (
            <div>
                <div className='Links'>
                    <Link to='/blocks'>Blocks</Link>
                    <Link to='/conduct-transaction'>Conduct transaction</Link>
                    <Link to='/transaction-pool'>Transaction pool</Link>
                </div>
                <div className="App">
                    <div className="logo">
                        <img src={logo}></img>
                    </div>
                    <div><h3>Welcome to Blockchain!!!</h3></div>
                    <br />

                    <div className="WalletInfo">
                        <div>Your wallet address is {address}</div>
                        <br />
                        <div>Available balance : {balance}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;