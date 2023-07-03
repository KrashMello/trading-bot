import { candlestick, sensitives } from './types'
import { Signal_CCI, Signal_MACD } from '@Modules/indicators/index'
import { signalMACDOutput } from '@Modules/indicators/types'

export function findSensitive(candlesticks: candlestick):sensitives {
  let sensitive: sensitives[] = []
  let actualmount = 10
  let order = false
  let cci: any
  let macd: signalMACDOutput[]
  let diffIndexCandlesticksMACD: number
  let diffIndexCandlesticksCCI: number
  let adviced: any
  let direction: any
  let close_price: number
  let buyMount = 0
  let mountToBuy = 0
  let profitPercent = 0
  let totalPercent = 0
  let cciAdviced

  for (let x = 0; x < 9; x++) {
    candlesticks.period = x + 3
    cci = Signal_CCI(candlesticks)
    adviced = false
    direction = 'down'
    diffIndexCandlesticksCCI = candlesticks.close.length - cci.length
    for (let y = 0; y < 13; y++) {
      actualmount = 10
      buyMount = 0
      mountToBuy = 0
      profitPercent = 0
      totalPercent = 0
      order = false
      macd = Signal_MACD(candlesticks.close, y + 3)
      diffIndexCandlesticksMACD = candlesticks.close.length - macd.length

      candlesticks.close.map((v: any, z: any) => {
        if (z < diffIndexCandlesticksMACD || z < diffIndexCandlesticksCCI)
          return undefined

        close_price = v
        adviced = macd[z - diffIndexCandlesticksMACD]?.adviced
        direction = macd[z - diffIndexCandlesticksMACD]?.direction
        cciAdviced = cci[z - diffIndexCandlesticksCCI]
        if (adviced && direction === 'up' && cciAdviced === 'up' && !order) {
          order = true
          mountToBuy = Math.round(actualmount) - 1
          buyMount = mountToBuy / close_price
          actualmount = actualmount - mountToBuy
          return {
            order: 'buy',
            buyMount,
            mountToBuy,
            actualmount,
            actualPrice: close_price,
          }
        } else if (
          adviced &&
          direction === 'down' &&
          cciAdviced === 'down' &&
          order
        ) {
          order = false
          profitPercent =
            ((buyMount * close_price + actualmount) * 100) /
              (actualmount + mountToBuy) -
            100
          totalPercent += profitPercent
          actualmount = buyMount * close_price + actualmount
          return {
            order: 'buy',
            buyMount,
            mountToBuy,
            actualmount,
            profitPercent,
            totalPercent,
            actualPrice: close_price,
          }
        } else if (z === candlesticks.close.length - 1 && order) {
          order = false
          profitPercent =
            ((buyMount * close_price + actualmount) * 100) /
              (actualmount + mountToBuy) -
            100
          totalPercent += profitPercent
          actualmount = buyMount * close_price + actualmount
          return {
            order: 'buy',
            buyMount,
            mountToBuy,
            actualmount,
            profitPercent,
            totalPercent,
            actualPrice: close_price,
          }
        } else return 'none'
      })
      sensitive.push({
        percent: totalPercent,
        cciPeriod: candlesticks.period,
        sensitiveMACD: y + 3,
      })
    }
  }
  return sensitive
    .sort((a, b) => {
      if (Number(a?.percent) > Number(b?.percent)) {
        return 1
      }
      if (Number(a?.percent) < Number(b?.percent)) {
        return -1
      }
      // a must be equal to b
      return 0
    })
    .reverse()[0] as any
}
