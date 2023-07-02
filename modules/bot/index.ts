import Binance from 'node-binance-api'
import { Signal_CCI, Signal_MACD } from '@Modules/indicators/index'

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
  private sensitives: { cciPeriod: number; sensitiveMACD: number } = {
    cciPeriod: 0,
    sensitiveMACD: 0,
  }

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
    let sensitive: {
      percent: number
      cciPeriod: number
      sensitiveMACD: number
    }[] = []
    let auxcandlesticks: {
      open: number[]
      high: number[]
      low: number[]
      close: number[]
      period: number
    } = { open: [], high: [], low: [], close: [], period: 0 }

    do {
      await binance
        .candlesticks(this.cryptoPar, this.temporality)
        .then((_r: any) => {
          _r.map((v: any) => {
            auxcandlesticks.open.push(Number(v[1]))
            auxcandlesticks.high.push(Number(v[2]))
            auxcandlesticks.low.push(Number(v[3]))
            auxcandlesticks.close.push(Number(v[4]))
          })
          let actualmount = 10
          let order = false
          for (let x = 0; x < 4; x++) {
            auxcandlesticks.period = x + 3
            for (let y = 0; y < 13; y++) {
              actualmount = 10
              order = false
              let cci = Signal_CCI(auxcandlesticks)
              let macd = Signal_MACD(auxcandlesticks.close, y + 3)
              let minicial = cci.length - macd.length
              cci.map((v: any, z: any) => {
                let adviced: any = false
                let direction: any = 'up'
                let close_price = Number(
                  auxcandlesticks?.close?.find((_el, k) => {
                    return k === z + (auxcandlesticks.close.length - cci.length)
                  })
                )
                if (z >= minicial) {
                  adviced = macd[z - minicial]?.adviced
                  direction = macd[z - minicial]?.direction
                }
                if (
                  adviced &&
                  direction === 'up' &&
                  v === 'up' &&
                  !order &&
                  z >= auxcandlesticks.close.length - cci.length
                ) {
                  order = true
                  actualmount = actualmount / close_price
                  return { actualmount, z, t: 'buy' }
                } else if (
                  adviced &&
                  direction === 'down' &&
                  v === 'down' &&
                  order &&
                  z >= auxcandlesticks.close.length - cci.length
                ) {
                  order = false
                  actualmount = actualmount * close_price
                  return { actualmount, z, t: 'sell' }
                } else if (z === cci.length - 1 && order) {
                  actualmount = actualmount * close_price
                  return 'none'
                } else return 'none'
              })
              sensitive.push({
                percent: (actualmount * 100) / 10 - 100,
                cciPeriod: auxcandlesticks.period,
                sensitiveMACD: y + 3,
              })
            }
          }
          let s = sensitive
            .sort((a, b) => {
              if (a.percent > b.percent) {
                return 1
              }
              if (a.percent < b.percent) {
                return -1
              }
              // a must be equal to b
              return 0
            })
            .reverse() as any
          console.log(s)
          console.log(s[0])
          this.sensitives.sensitiveMACD = s[0].sensitiveMACD
          this.sensitives.cciPeriod = s[0].cciPeriod
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

    console.info({
      1: this.principalCurrencyMount,
      2: this.secondaryCurrencyMount,
      3: this.parAvailable,
      4: this.sensitives,
    })
  }

  // private buy() {}

  // private sell() {}

  protected evaluation() {}

  protected async calculate() {
    try {
      binance.websockets.chart(
        this.cryptoPar,
        this.temporality,
        (_symbol: any, _interval: any, chart: any) => {
          let values: {
            open: number[]
            high: number[]
            low: number[]
            close: number[]
          } = {
            open: [],
            high: [],
            low: [],
            close: [],
          }
          Object.values(chart)
            .reverse()
            .map((v: any) => {
              values.open.push(Number(v.open))
              values.high.push(Number(v.high))
              values.low.push(Number(v.low))
              values.close.push(Number(v.close))
            })
          // console.info(values)
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
