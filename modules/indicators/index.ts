import { CCI, MACD } from 'technicalindicators'

// green
/**
 * @param values
 * @param sensitive
 * the sensitive just round in 6 - 8 for good result
 * 6: high values
 * 8: low values
 **/
export function Signal_MACD(
  values: number[],
  sensitive: number
): {
  duration: number
  persisted: boolean
  direction: string
  adviced: boolean
}[] {
  let donw_up_persistency =
    25 *
    Math.pow(
      10,
      -sensitive +
        Number(Number(values[0]).toExponential(0).toString().slice(2, 500))
    )
  // console.log(
  //   Number(Number(values[0]).toExponential(0).toString().slice(2, 500)),
  //   donw_up_persistency
  // )
  let down = -donw_up_persistency
  let up = donw_up_persistency
  let persistence = 1
  let trend = {
    duration: 0,
    persisted: false,
    direction: 'up',
    adviced: false,
  }

  let MACDt: {
    duration: number
    persisted: boolean
    direction: string
    adviced: boolean
  }[] = []
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
