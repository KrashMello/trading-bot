import Binance from 'node-binance-api'
import { candlestick, sensitives } from '@Modules/bot/types'
import { findSensitive } from './service'
import { Signal_CCI, Signal_MACD } from '@Modules/indicators/index'
import { DB } from '@Modules/DB'

const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
})

export class Bot {
  protected name: string
  protected cryptoPar: string = 'BTCUSDT'
  protected parAvailable: boolean = false
  protected temporality: string = '5m'
  protected sensitive: number
  protected testMode: boolean
  private principalCurrencyMount: number = 0
  private testPrincipalCurrencyMount: number = 15
  private secondaryCurrencyMount: number = 0
  private testSecondaryCurrencyMount: number = 0
  private order: boolean = false
  private mountToBuy: number = 0

  private sensitives: sensitives = {
    cciPeriod: 0,
    sensitiveMACD: 0,
  }
  private db = new DB('order')

  constructor(
    name: string,
    crossOne: string,
    crossTwo: string,
    sensitive: number
  ) {
    this.name = name
    this.sensitive = sensitive
    this.testMode = true
    this.configure(crossOne, crossTwo)
  }

  public get getName(): string {
    return this.name
  }

  public get getCryptoPar(): string {
    return this.cryptoPar
  }

  public set setCryptoPar(value: string) {
    this.cryptoPar = value
  }

  public get getTemporality(): string {
    return this.temporality
  }

  public set setTemporality(value: string) {
    this.temporality = value
  }

  public get getTestMode(): boolean {
    return this.testMode
  }

  public set setTestMode(value: boolean) {
    this.testMode = value
  }

  public get getPrincipalCurrencyMount(): number {
    return this.principalCurrencyMount
  }

  public set setPrincipalCurrencyMount(value: number) {
    this.principalCurrencyMount = value
  }

  public get getSecond1aryCurrencyMount(): number {
    return this.secondaryCurrencyMount
  }

  public set setSecondaryCurrencyMount(value: number) {
    this.secondaryCurrencyMount = value
  }

  public get getParAvailable(): boolean {
    return this.parAvailable
  }

  public set setParAvailable(value: boolean) {
    this.parAvailable = value
  }

  public get getTestPincipalCurrencyMount(): number {
    return this.testPrincipalCurrencyMount
  }

  public set setTestPrincipalCurrencyMount(value: number) {
    this.testPrincipalCurrencyMount = value
  }

  public get getTestSecondaryCurrencyMount(): number {
    return this.testSecondaryCurrencyMount
  }

  public set setTestSecondaryCurrencyMount(value: number) {
    this.testSecondaryCurrencyMount = value
  }

  private async configure(crossOne: string, crossTwo: string) {
    let i = 0
    this.cryptoPar = crossOne + crossTwo
    let auxParAvailable = false
    let auxPrincipalCurrencyMount = 0
    let auxSecondaryCurrencyMount = 0

    let candlesticks: candlestick = {
      open: [],
      high: [],
      low: [],
      close: [],
      period: 0,
    }
    do {
      await binance
        .candlesticks(this.cryptoPar, this.temporality)
        .then((_r: any) => {
          _r.map((v: any) => {
            candlesticks.open.push(Number(v[1]))
            candlesticks.high.push(Number(v[2]))
            candlesticks.low.push(Number(v[3]))
            candlesticks.close.push(Number(v[4]))
          })
          let sensitive = findSensitive(candlesticks)
          this.sensitives.sensitiveMACD = sensitive.sensitiveMACD
          this.sensitives.cciPeriod = sensitive.cciPeriod
          i = 999
          auxParAvailable = true
        })
        .catch((_e: any) => {
          this.cryptoPar = crossTwo + crossOne
        })
      i++
    } while (i < 2)
    this.parAvailable = auxParAvailable
    if (this.parAvailable)
      await binance
        .balance()
        .then((balances: any) => {
          auxPrincipalCurrencyMount = Number(balances[crossOne].available)
          auxSecondaryCurrencyMount = Number(balances[crossTwo].available)
        })
        .catch((error: any) => {
          if (error) return console.error(error.body)
        })
    this.principalCurrencyMount = auxPrincipalCurrencyMount
    this.secondaryCurrencyMount = auxSecondaryCurrencyMount
    this.start()
    console.info({
      1: this.principalCurrencyMount,
      2: this.secondaryCurrencyMount,
      3: this.parAvailable,
      4: this.sensitives,
    })
  }

  private buy(values: any) {
    this.db.insertOne(values)
  }

  private sell(values: any) {
    this.db.insertOne(values)
  }

  protected evaluation() {}

  protected async calculate() {
    try {
      if (this.parAvailable)
        binance.websockets.chart(
          this.cryptoPar,
          this.temporality,
          (_symbol: any, _interval: any, chart: any) => {
            let candlesticks: candlestick = {
              open: [],
              high: [],
              low: [],
              close: [],
              period: this.sensitives.cciPeriod,
            }
            Object.values(chart).map((v: any) => {
              candlesticks.open.push(Number(v.open))
              candlesticks.high.push(Number(v.high))
              candlesticks.low.push(Number(v.low))
              candlesticks.close.push(Number(v.close))
            })
            let lastPrice = candlesticks.close.reverse()[0]

            let cci = Signal_CCI(candlesticks).reverse()
            let macd = Signal_MACD(
              candlesticks.close,
              this.sensitives.sensitiveMACD
            ).reverse()
            if (
              macd[1]?.adviced &&
              macd[1]?.direction === 'up' &&
              cci[1] === 'up' &&
              !this.order
            ) {
              this.order = true
              this.mountToBuy = Math.round(this.testPrincipalCurrencyMount) - 1
              this.testSecondaryCurrencyMount =
                this.mountToBuy / Number(lastPrice)
              this.testPrincipalCurrencyMount =
                this.testPrincipalCurrencyMount - this.mountToBuy
              this.buy({
                order: 'buy',
                buyMount: this.testSecondaryCurrencyMount,
                mountToBuy: this.mountToBuy,
                actualMount: this.testPrincipalCurrencyMount,
                actualPrice: lastPrice,
                createAt: new Date().toLocaleString('en-US', {
                  timeZone: 'UTC',
                }),
              })
            } else if (
              macd[1]?.adviced &&
              macd[1]?.direction === 'down' &&
              cci[1] === 'down' &&
              this.order
            ) {
              this.order = false
              this.testPrincipalCurrencyMount =
                this.testSecondaryCurrencyMount * Number(lastPrice) +
                this.testPrincipalCurrencyMount
              this.sell({
                order: 'sell',
                actualMount: this.testPrincipalCurrencyMount,
                sellMount: this.testSecondaryCurrencyMount,
                profitPercent:
                  ((this.testSecondaryCurrencyMount * Number(lastPrice) +
                    this.testPrincipalCurrencyMount) *
                    100) /
                    (this.testPrincipalCurrencyMount + this.mountToBuy) -
                  100,
                sellPrice: lastPrice,
                createAt: new Date().toLocaleString('en-US', {
                  timeZone: 'UTC',
                }),
              })
              this.testSecondaryCurrencyMount = 0
            }
            // console.info(values.close.reverse()[0])
            // let tick = binance.last(chart)
            // const last = chart[tick].close
            // console.info(symbol + ' last price: ' + last)
          }
        )
    } catch (error: any) {
      this.start()
    }
  }

  public start() {
    this.calculate()
  }
}
