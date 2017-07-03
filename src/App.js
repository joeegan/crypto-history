import React, { Component } from 'react';
import './App.css';
import moment from 'moment';
import io from 'socket.io-client';

const personalData = [{
  name: 'IOT',
  ticker: 'IOT~BTC',
  gbpCost: 30.8,
  volume: 100,
  provider: 'Bitfinex',
  purchaseDate: '2017-6-16',
},
{
  name: 'ETH',
  ticker: 'ETH~BTC',
  gbpCost: 60.00,
  volume: 0.21543515,
  provider: 'Coinbase',
  purchaseDate: '2017-6-16',
}];

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      oneBtcInGbp: 2000,
      time: null,
      gbp: {
        IOT: null,
        ETH: null,
      }
    };
  }

  componentDidMount() {

    // Stream BTC/GBP exchange rate for conversion usage
    var socket = io.connect('https://streamer.cryptocompare.com/');
    socket.emit('SubAdd', { subs: ['5~CCCAGG~BTC~GBP'] });
    socket.on('m', message => {
      const msg = message.split('~');
      const responseTicker = `${msg[2]}~${msg[3]}`;
      const price = msg[5];
      const subscriptionId = msg[0];
      if (price && subscriptionId === '5' && responseTicker === 'BTC~GBP') {
        this.setState({
          oneBtcInGbp: price,
        });
      }
    });

    // Stream portfolio relevant currencies agaisnt BTC
    personalData.map(d => d.ticker).forEach(ticker => {
      socket.emit('SubAdd', { subs: ['5~CCCAGG~' + ticker] });
      socket.on('m', msg => {
        const [
          subscriptionId,
          exchangeName,
          fromCurrency,
          toCurrency,
          flag,
          price,
          lastUpdate,
          lastVolume,
          lastVolumeTo,
          lastTradeId,
          volume24h,
          volume24hTo,
          lastMarket,
        ] = msg.split('~');
        const responseTicker = `${fromCurrency}~${toCurrency}`;
        if (subscriptionId === '5' && responseTicker === ticker) {
          // console.log(ticker, price);
          this.updatePrice(fromCurrency, price)
        }
      });

    });

  }

  updatePrice(fromCurrency, price) {
   this.setState({
     gbp: Object.assign({}, this.state.gbp, {
       [fromCurrency]: this.state.oneBtcInGbp / price,
     }),
   });
  }

  render() {
    const rows = personalData.map((c, i) => {
      // console.log(this.state.gbp)
      const currentValue = this.state.gbp[c.name] ? this.state.gbp[c.name] : 1; // * [c.volume];
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
          <td className='right'>£{(currentValue)}</td>
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
