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
      time: null,
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
          },
          time: moment(new Date()).format('h:mm:ssa'),
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
          <td className='left'>{c.name}</td>
          <td className='right'>{c.volume.toFixed(2)}</td>
          <td className='right'>£{c.gbpCost.toFixed(2)}</td>
          <td className='right'>£{(currentValue).toFixed(2)}</td>
          <td className='right'>£{profit.toFixed(2)}</td>
          <td className='right'>{profitPct.toFixed(2)}%</td>
          <td className='left'>{c.provider}</td>
          <td className='left'>{days.toFixed()} days</td>
        </tr>
      )
    })
    return (
      <div className="App">
        <div className="App-header">
          <h2>Crypto trade history</h2>
          <p>(Snapshot data only) provided by coinmarketcap.com @ {this.state.time}</p>
        </div>
        <div className="center-wrap">
          <table>
            <thead>
              <tr>
                <th className='center'>Currency</th>
                <th className='center'>Volume</th>
                <th className='center'>Bought at</th>
                <th className='center'>Current value</th>
                <th className='center'>Profit</th>
                <th className='center'>Profit %</th>
                <th className='center'>Provider</th>
                <th className='center'>Age</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
