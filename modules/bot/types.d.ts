export interface sensitives {
  percent?: number
  cciPeriod: number
  sensitiveMACD: number
}

export interface candlestick {
  open: number[]
  high: number[]
  low: number[]
  close: number[]
  period: number
}
