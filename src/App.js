import React, { Component } from 'react';
import './App.css';
import moment from 'moment';

const find = (str, json) =>
  json.find(({ name }) => name === str).price_gbp;

const personalData = [{
  name: 'IOTA',
  ticker: 'IOTBTC',
  gbpCost: 30.8,
  volume: 100,
  provider: 'Bitfinex',
  purchaseDate: '2017-6-16',
},
{
  name: 'Ethereum',
  ticker: 'ETHBTC',
  gbpCost: 60.00,
  volume: 0.21543515,
  provider: 'Coinbase',
  purchaseDate: '2017-6-16',
}];

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      oneBtcInGbp: null,
      time: null,
      gbp: {
        IOTA: null,
        Ethereum: null,
      }
    };
  }

  componentDidMount() {

    const fetchFX = () => {
      fetch(`https://api.coinmarketcap.com/v1/ticker/?convert=GBP&limit=10`).then(response => {
        response.json().then(json => {
          this.setState({
            oneBtcInGbp: json.find(c => c.id === 'bitcoin').price_gbp,
            time: moment(new Date()).format('h:mm:ssa'),
          });
        });
      });
    }

    fetchFX();
    setInterval(fetchFX, 20000);

    personalData.map(d => d.ticker).forEach(ticker => {
      const wss = new WebSocket('wss://api.bitfinex.com/ws/');
      wss.onopen = () => {
        wss.send(JSON.stringify({
           event: 'subscribe',
           channel: 'ticker',
           pair: ticker,
        }));
        wss.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data[1] === 'hb' || typeof data[6] !== 'number') {
            return;
          }
          const lastPrice = data[6];
          const name = personalData.find(d => d.ticker === ticker).name;
          console.log('lastPrice', lastPrice, 'name', name);
          this.setState({
            gbp: {
              [name]: lastPrice * this.state.oneBtcInGbp,
            },
          });
        }
      }
    });
  }

  render() {
    const rows = personalData.map((c, i) => {
      const currentValue = this.state.gbp[c.name] * [c.volume];
      const profit = currentValue - c.gbpCost;
      const profitPct = profit / c.gbpCost * 100;
      var now = moment(new Date());
      var end = moment(c.purchaseDate);
      var duration = moment.duration(now.diff(end));
      var days = duration.asDays();
      return (
        <tr key={i}>
          <td className='left'><select><option value={c.name}>{c.name}</option></select></td>
          <td className='right'><input type='number' value={c.volume.toFixed(2)} /></td>
          <td className='right'>£<input type='number' value={c.gbpCost.toFixed(2)} /></td>
          <td className='right'><input type='datetime-local' value='2017-06-17T08:30' /></td>
          <td className='left'><input value={c.provider} /></td>
          <td className='right'>£{(currentValue).toFixed(2)}</td>
          <td className='right'>£{profit.toFixed(2)}</td>
          <td className='right'>{profitPct.toFixed(2)}%</td>
          <td className='left'>{days.toFixed()} days</td>
        </tr>
      )
    })
    return (
      <div className='App'>
        <div className='App-header'>
          <h2>Crypto trade history</h2>
          <p>Converted to GBP @ {this.state.time}</p>
        </div>
        <div className='center-wrap'>
          <table>
            <thead>
              <tr>
                <th className='center'>Currency</th>
                <th className='center'>Volume</th>
                <th className='center'>Bought at</th>
                <th className='center'>Date bought</th>
                <th className='center'>Notes</th>
                <th className='center'>Current value</th>
                <th className='center'>Profit</th>
                <th className='center'>Profit %</th>
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
