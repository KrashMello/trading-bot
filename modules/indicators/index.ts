import { CCI, MACD } from 'technicalindicators'

// green
/**
 * @param values 
 * @param sensitive 
 * the sensitive just round in 6 - 8 for good result
 * 8: high values
 * 6: low values
**/
export function Signal_MACD(values: number[], sensitive: number) {
  let donw_up_persistency =
    25 *
    Math.pow(
      10,
      -(sensitive + Number(Number(values[0]).toExponential(0).toString().slice(2, 500)))
    )
  console.log(donw_up_persistency)
  let down = -donw_up_persistency
  let up = donw_up_persistency
  let persistence = 1
  let trend = {
    duration: 0,
    persisted: false,
    direction: 'up',
    adviced: false,
  }

  let MACDt: object[] = []
  if (values.length <= 0) return MACDt

  return MACD.calculate({
    values: values,
    fastPeriod: 12,
    slowPeriod: 8,
    signalPeriod: 3,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  }).map((values) => {
    let result = {
      MACD: Number(values.MACD).toFixed(8),
      histogram: Number(values.histogram).toFixed(8),
      signal: Number(values.signal).toFixed(8),
    }

    let diff: number = Number(result.MACD) - Number(result.signal)
    if (diff > up) {
      // new trend detected
      if (trend.direction !== 'up')
        trend = {
          duration: 0,
          persisted: false,
          direction: 'up',
          adviced: false,
        }
      trend.duration = trend.duration + 1

      if (trend.duration >= persistence) trend.persisted = true

      if (trend.persisted && !trend.adviced) {
        trend.adviced = true
      }
    } else if (diff < down) {
      if (trend.direction !== 'down')
        trend = {
          duration: 0,
          persisted: false,
          direction: 'down',
          adviced: false,
        }

      trend.duration = trend.duration + 1

      if (trend.duration >= persistence) trend.persisted = true

      if (trend.persisted && !trend.adviced) {
        trend.adviced = true
      }
    } else {
      trend = {
        duration: 0,
        persisted: false,
        direction: 'none',
        adviced: false,
      }
    }
    return {
      duration: trend.duration,
      persisted: trend.persisted,
      direction: trend.direction,
      adviced: trend.adviced,
    }
  })
}

export function Signal_CCI(values: {
  open: number[]
  high: number[]
  low: number[]
  close: number[]
  period: number
}) {
  /*The idea is to optimize only the CCI value.
    - Buy side: CCI between -700 and 0
    - Sell side: CCI between 0 and 700*/
  let max_down = 700
  let max_up = -700
  let trend = 'none'
  return CCI.calculate(values).map((v) => {
    if (v > max_up && v < -58) trend = 'up'
    else if (v > 100 && v < max_down) trend = 'down'
    else trend = 'none'
    return trend
  })
}

//#region excluid function
// green
// export function FBollingerBand(values: number[]) {
//   let BB = 0
//   if (values.length > 0) {
//     BB = bb.calculate({
//       period: 14,
//       values: values,
//       stdDev: 2,
//     })
//     BB.map((value, index, bb) => {
//       bb[index].middle = Number(value.middle).toFixed(3)
//       bb[index].upper = Number(value.upper).toFixed(3)
//       bb[index].lower = Number(value.lower).toFixed(3)
//       bb[index].pb = Number(value.pb).toFixed(3)
//     })
//   }

//   return BB
// }
// function strengthCandlesticks(chart) {
//   if (Array.isArray(chart))
//     for (let i = 0; i < chart.length; i++) {
//       // 1-((chart!C3-chart!B3)/(chart!C3-chart!D3))
//       const tempA = chart[i].high - chart[i].open
//       const tempB = chart[i].high - chart[i].close
//       const highminuslow = chart[i].high - chart[i].low
//       let shortMecha = false
//       chart[i].open = Number(1 - tempA / highminuslow).toFixed(2)
//       chart[i].close = Number(1 - tempB / highminuslow).toFixed(2)
//       chart[i].high = 1
//       chart[i].low = 0
//       /*
//        * type es igual al estilo de la vela
//        * 0: vela roja - sell
//        * 1: vela verde - buy
//        */
//       if (chart[i].open <= chart[i].close) {
//         chart[i].body = Number(chart[i].close - chart[i].open).toFixed(2)
//         chart[i].mechaTop = Number(chart[i].high - chart[i].close).toFixed(2)
//         chart[i].mechaBottom = Number(chart[i].low + chart[i].open).toFixed(2)
//         chart[i].type = 1
//       } else {
//         chart[i].body = Number(chart[i].open - chart[i].close).toFixed(2)
//         chart[i].mechaTop = Number(chart[i].high - chart[i].open).toFixed(2)
//         chart[i].mechaBottom = Number(chart[i].low + chart[i].close).toFixed(2)
//         chart[i].type = 0
//       }
//       if (chart[i].mechaBottom <= 0.2 || chart[i].mechaTop <= 0.2) {
//         shortMecha = true
//       }
//       /*
//        * indicadores de fuerza de la vela o tamaño que tienen en el grafico
//        * 0: fuerte
//        * 1: media
//        * 2: debil
//        */
//       if (
//         i > 0 &&
//         chart[i].body > chart[i - 1].body &&
//         shortMecha &&
//         chart[i].body > 0.8
//       ) {
//         chart[i].strength = 0
//       } else if (
//         i > 0 &&
//         chart[i].body > chart[i - 1].body &&
//         shortMecha &&
//         chart[i].body > 0.45
//       ) {
//         chart[i].strength = 1
//       } else {
//         chart[i].strength = 2
//       }
//       //if(AND(J14= "sell",J13 = "buy"),"up","down")
//       /*
//        *alertas
//        * 0: down
//        * 1: up
//        */
//       if (i > 0 && chart[i].type === 1 && chart[i - 1].type === 0)
//         chart[i].alert = 1
//       else chart[i].alert = 0
//       /*
//             =if(AND(J211="sell",J212="sell",J210="buy"),"soporte",
//             if(OR(
//             AND(J211 = "buy",K212 = "soporte",I211="fuerte"),
//             AND(J211 = "buy",K212 = "soporte",I211="media"),
//             AND(J211 = "buy",K212 = "sell",I211="fuerte"),
//             AND(J211 = "buy",K212 = "sell",I211="media"),
//             AND(J211 = "buy",J212 = "buy",K212 = "",K213 = "sell",I211="fuerte"),
//             AND(J211 = "buy",K213 = "sell",K212 = "",J212 = "buy",I211="media"),
//             AND(J211 = "buy",J212 = "buy",K212 = "",K213 = "soporte",I211="fuerte"),
//             AND(J211 = "buy",K213 = "soporte",K212 = "",J212 = "buy",I211="media")),"buy",
//             if(and(J212= "buy",J211 = "sell"),"sell","")))*/
//       /*
//        * estados de la activacion
//        * 0: vacio
//        * 1: soporte
//        * 2: compra
//        * 3: venta
//        */
//       if (
//         i > 1 &&
//         chart[i - 1].alert === 0 &&
//         chart[i].alert === 1 &&
//         chart[i - 2].type === 0
//       )
//         chart[i - 1].activate = 1
//       if (
//         (i > 0 &&
//           chart[i].type === 1 &&
//           chart[i - 1].activate === 1 &&
//           chart[i].strength === 0) ||
//         (i > 0 &&
//           chart[i].type === 1 &&
//           chart[i - 1].activate === 1 &&
//           chart[i].strength === 1) ||
//         (i > 0 &&
//           chart[i].type === 1 &&
//           chart[i - 1].activate === 3 &&
//           chart[i].strength === 0) ||
//         (i > 0 &&
//           chart[i].type === 1 &&
//           chart[i - 1].activate === 3 &&
//           chart[i].strength === 1) ||
//         (i > 0 &&
//           chart[i].type === 1 &&
//           chart[i - 1].alert === 1 &&
//           chart[i].strength === 0) ||
//         (i > 0 &&
//           chart[i].type === 1 &&
//           chart[i - 1].alert === 1 &&
//           chart[i].strength === 1)
//       )
//         chart[i].activate = 2
//       else if (i > 0 && chart[i].type === 0 && chart[i - 1].type === 1)
//         chart[i].activate = 3
//       else chart[i].activate = 0
//     }
//   return chart
// }
// // green
// export function FEMA(period, values) {
//   let EMA = []
//   if (values.length > 0) {
//     EMA = tema.calculate({
//       period: period,
//       values: values,
//     })
//     EMA.map((value, index, ema) => {
//       ema[index] = Number(value).toFixed(2)
//     })
//     return EMA
//   }
// }

// export function extractDataToKlines(klines) {
//   if (Array.isArray(klines)) {
//     klines.map((value, index, kline) => {
//       kline[index] = Number(value[4])
//     })
//     return klines
//   }
// }
// export function FStochRSI(values) {
//   let SRSI = []
//   if (values.length > 0) {
//     SRSI = srsi.calculate({
//       rsiPeriod: 14,
//       stochasticPeriod: 14,
//       kPeriod: 3,
//       dPeriod: 3,
//       values: values,
//     })
//     SRSI.map((values, index, srsi) => {
//       srsi[index].stochRSI = Number(values.stochRSI).toFixed(2)
//       srsi[index].k = Number(values.k).toFixed(2)
//       srsi[index].d = Number(values.d).toFixed(2)
//     })
//   }
//   return SRSI
// }
//#endregion

// let candlestick = candlestickADA
//
// let inputCCI = {
//   open: [],
//   high: [],
//   low: [],
//   close: [],
//   period: 8,
// }
// candlestick.map((v) => {
//   inputCCI.open.push(Number(v[1]))
//   inputCCI.high.push(Number(v[2]))
//   inputCCI.low.push(Number(v[3]))
//   inputCCI.close.push(Number(v[4]))
// })
// let cci = Signal_CCI(inputCCI)
// let macd = Signal_MACD(inputCCI.close)
// let actualmount = 10
// let order = false
// let adviced = macd.reverse().map((v, i) => {
//   if (
//     v.adviced &&
//     v.direction === 'up' &&
//     cci.reverse()[i] === 'up' &&
//     !order
//   ) {
//     order = true
//     actualmount = actualmount / candlestick.reverse()[i][4]
//     return { i, t: 'buy' }
//   } else if (
//     v.adviced &&
//     v.direction === 'down' &&
//     cci.reverse()[i] === 'down' &&
//     order
//   ) {
//     order = false
//     actualmount = actualmount * candlestick.reverse()[i][4]
//     return { i, t: 'sell' }
//   } else return 'none'
// })
// console.log(actualmount)
