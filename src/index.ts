import express from 'express'
import 'dotenv/config'
import { Bot } from '../modules/bot/index'

// inicial config
const app = express()
app.use(express.json())
// modules
// import { menu, loadingData } from "./modules/cli.mjs";
//
async function main() {
  console.clear()
  console.info('server started on http://localhost:5000')
  let bt = new Bot('daemon', 'BNB', 'BTC', 6)
  console.info(
    bt.getName,
    bt.getPrincipalCurrencyMount,
    bt.getSecond1aryCurrencyMount,
    bt.getParAvailable
  )
  // binance.websockets.chart(
  //   'BTCUSDT',
  //   '5m',
  //   (symbol: any, _interval: any, chart: any) => {
  //     let values: {open:string[]; high: string[]; low: string[]; close: string[]} = {
  //       open: [],
  //       high: [],
  //       low: [],
  //       close: [],
  //     }
  //     Object.values(chart)
  //       .reverse()
  //       .map(
  //         (v: any) => {
  //           values.open.push(v.open as string)
  //           values.high.push(v.high as string)
  //           values.low.push(v.low)
  //           values.close.push(v.close)
  //         }
  //       )

  //     console.info(values)
  //     let tick = binance.last(chart)

  //     const last = chart[tick].close

  //     console.info(symbol + ' last price: ' + last)
  //   }
  // )

  //
  // loadingData();
  // setTimeout(() => {
  //   menu();
  // }, 2000);
}

app.listen(process.env.SERVER_PORT, () => {
  main()
})
