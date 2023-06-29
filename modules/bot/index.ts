import Binance from 'node-binance-api'

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
  private secondaryCurrencyMount: number = 0

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

  public set setParAvailable(value : boolean) {
    this.parAvailable = value;
  }

  private async configure(crossOne: string, crossTwo: string) {
    let i = 0
    this.cryptoPar = crossOne + crossTwo
    let auxParAvailable = false
    let auxPrincipalCurrencyMount = 0
    let auxSecondaryCurrencyMount = 0

    do {
      await binance
        .candlesticks(this.cryptoPar, '5m')
        .then((_r: any) => {
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
        await binance.balance().then((balances: any)=>{

          auxPrincipalCurrencyMount = Number(balances[crossOne].available)
          auxSecondaryCurrencyMount = Number(balances[crossTwo].available)
    }).catch((error:any)=>{

      if (error) return console.error(error.body)
    })
           this.principalCurrencyMount = auxPrincipalCurrencyMount
    this.secondaryCurrencyMount = auxSecondaryCurrencyMount
  
    console.info({1:this.principalCurrencyMount,2:this.secondaryCurrencyMount, 3:this.parAvailable})
  }

  // private buy() {}

  // private sell() {}

  protected evaluation() {}

  protected async calculate() {
    binance.websockets.chart(
      this.cryptoPar,
      this.temporality,
      (symbol: any, _interval: any, chart: any) => {
        Object.values(chart)
          .reverse()
          .map((v: any) => {
            console.log(v)
          })
        let tick = binance.last(chart)
        const last = chart[tick].close
        console.info(symbol + ' last price: ' + last)
      }
    )
  }

  public start() {
    this.calculate()
  }
}
