import React, { Component } from 'react';
import './App.css';
import moment from 'moment';

const find = (str, json) =>
  json.find(({ name }) => name === str).price_gbp;

const personalData = [{
  name: 'IOTA',
  gbpCost: 30.8,
  volume: 100,
  provider: 'Bitfinex',
  purchaseDate: '2017-6-16'
,
},
{
  name: 'Ethereum',
  gbpCost: 60.00,
  volume: 0.21543515,
  provider: 'Coinbase',
  purchaseDate: '2017-6-16',
}];

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gbp: {
        btc: null,
        iota: null,
        ethereum: null,
      }
    };
  }

  componentDidMount() {

    fetch(`https://api.coinmarketcap.com/v1/ticker/?convert=GBP&limit=10`).then(response => {
      response.json().then(json => {
        this.setState({
          gbp: {
            IOTA: find('IOTA', json),
            Ethereum: find('Ethereum', json),
          }
        });
      });
    });
  }

  render() {
    const rows = personalData.map((c, i) => {
      const currentValue = this.state.gbp[c.name] * [c.volume];
      const profit = currentValue - c.gbpCost;
      const profitPct = profit / c.gbpCost * 199;
      var now = moment(new Date()); //todays date
      var end = moment(c.purchaseDate); // another date
      var duration = moment.duration(now.diff(end));
      var days = duration.asDays();
      return (
        <tr key={i}>
          <td>{c.name}</td>
          <td>{c.volume}</td>
          <td>£{c.gbpCost}</td>
          <td>£{(currentValue).toFixed(2)}</td>
          <td>£{profit.toFixed(2)}</td>
          <td>{profitPct.toFixed(2)}%</td>
          <td>{c.provider}</td>
          <td>{days.toFixed()} days ago</td>
        </tr>
      )
    })
    return (
      <div className="App">
        <div className="App-header">
          <h2>My crypto-trade history</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Currency</th>
              <th>Volume</th>
              <th>Bought at</th>
              <th>Current value</th>
              <th>Profit</th>
              <th>Profit %</th>
              <th>Provider</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
