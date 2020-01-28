import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import App from './components/App';
import Blocks from './components/Blocks';
import ConductTransaction from './components/Conduct-Transaction';
import TransactionPool from './components/TransactionPool';
import BlockData from './components/BlockData';
import './index.css';

render(
    <Router history={history}>
        <Switch>
            <Route exact path='/' component={App} />
            <Route path='/blocks' component={Blocks} />
            {/* <Route path='/block-data:block' component={BlockData} /> */}
            <Route path='/block-data:blockNumber' component={BlockData} />
            <Route path='/conduct-transaction' component={ConductTransaction} />
            <Route path='/transaction-pool' component={TransactionPool} />
        </Switch>
    </Router>
    ,
    document.getElementById("root")
);
