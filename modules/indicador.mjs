
import TI from "technicalindicators";
import chalk from "chalk";


let actualMACD = {};
let actualBB = {};
let stochRSIActual = {};

let crossDKRSI = false;

export function getActualMACD(){
    return actualMACD
}
export function getActualBB(){
    return actualBB
}
export function getStochRSIActual(){
    return stochRSIActual
}

export function getCrossDKRSI(){
    return crossDKRSI;
}


function strengthCandlesticks(chart) {
    if (Array.isArray(chart))
      for (let i = 0; i < chart.length; i++) {
        // 1-((chart!C3-chart!B3)/(chart!C3-chart!D3))
        const tempA = chart[i].high - chart[i].open;
        const tempB = chart[i].high - chart[i].close;
        const highminuslow = chart[i].high - chart[i].low;
        let shortMecha = false;
        chart[i].open = Number(1 - tempA / highminuslow).toFixed(2);
        chart[i].close = Number(1 - tempB / highminuslow).toFixed(2);
        chart[i].high = 1;
        chart[i].low = 0;
        /*
         * type es igual al estilo de la vela
         * 0: vela roja - sell
         * 1: vela verde - buy
         */
        if (chart[i].open <= chart[i].close) {
          chart[i].body = Number(chart[i].close - chart[i].open).toFixed(2);
          chart[i].mechaTop = Number(chart[i].high - chart[i].close).toFixed(2);
          chart[i].mechaBottom = Number(chart[i].low + chart[i].open).toFixed(2);
          chart[i].type = 1;
        } else {
          chart[i].body = Number(chart[i].open - chart[i].close).toFixed(2);
          chart[i].mechaTop = Number(chart[i].high - chart[i].open).toFixed(2);
          chart[i].mechaBottom = Number(chart[i].low + chart[i].close).toFixed(2);
          chart[i].type = 0;
        }
        if (chart[i].mechaBottom <= 0.2 || chart[i].mechaTop <= 0.2) {
          shortMecha = true;
        }
        /*
         * indicadores de fuerza de la vela o tamaño que tienen en el grafico
         * 0: fuerte
         * 1: media
         * 2: debil
         */
        if (
          i > 0 &&
          chart[i].body > chart[i - 1].body &&
          shortMecha &&
          chart[i].body > 0.8
        ) {
          chart[i].strength = 0;
        } else if (
          i > 0 &&
          chart[i].body > chart[i - 1].body &&
          shortMecha &&
          chart[i].body > 0.45
        ) {
          chart[i].strength = 1;
        } else {
          chart[i].strength = 2;
        }
        //if(AND(J14= "sell",J13 = "buy"),"up","down")
        /*
         *alertas
         * 0: down
         * 1: up
         */
        if (i > 0 && chart[i].type === 1 && chart[i - 1].type === 0)
          chart[i].alert = 1;
        else chart[i].alert = 0;
        /*
            =if(AND(J211="sell",J212="sell",J210="buy"),"soporte",
            if(OR(
            AND(J211 = "buy",K212 = "soporte",I211="fuerte"),
            AND(J211 = "buy",K212 = "soporte",I211="media"),
            AND(J211 = "buy",K212 = "sell",I211="fuerte"),
            AND(J211 = "buy",K212 = "sell",I211="media"), 
            AND(J211 = "buy",J212 = "buy",K212 = "",K213 = "sell",I211="fuerte"),
            AND(J211 = "buy",K213 = "sell",K212 = "",J212 = "buy",I211="media"),
            AND(J211 = "buy",J212 = "buy",K212 = "",K213 = "soporte",I211="fuerte"),
            AND(J211 = "buy",K213 = "soporte",K212 = "",J212 = "buy",I211="media")),"buy",
            if(and(J212= "buy",J211 = "sell"),"sell","")))*/
        /*
         * estados de la activacion
         * 0: vacio
         * 1: soporte
         * 2: compra
         * 3: venta
         */
        if (
          i > 1 &&
          chart[i - 1].alert === 0 &&
          chart[i].alert === 1 &&
          chart[i - 2].type === 0
        )
          chart[i - 1].activate = 1;
        if (
          (i > 0 &&
            chart[i].type === 1 &&
            chart[i - 1].activate === 1 &&
            chart[i].strength === 0) ||
          (i > 0 &&
            chart[i].type === 1 &&
            chart[i - 1].activate === 1 &&
            chart[i].strength === 1) ||
          (i > 0 &&
            chart[i].type === 1 &&
            chart[i - 1].activate === 3 &&
            chart[i].strength === 0) ||
          (i > 0 &&
            chart[i].type === 1 &&
            chart[i - 1].activate === 3 &&
            chart[i].strength === 1) ||
          (i > 0 &&
            chart[i].type === 1 &&
            chart[i - 1].alert === 1 &&
            chart[i].strength === 0) ||
          (i > 0 &&
            chart[i].type === 1 &&
            chart[i - 1].alert === 1 &&
            chart[i].strength === 1)
        )
          chart[i].activate = 2;
        else if (i > 0 && chart[i].type === 0 && chart[i - 1].type === 1)
          chart[i].activate = 3;
        else chart[i].activate = 0;
      }
    return chart;
  }
  // green
export function FEMA(period, values) {
    const tema = TI.EMA;
    let EMA = 0;
    if (values.length > 0) {
      EMA = tema.calculate({
        period: period,
        values: values,
      });
      
      for(let i = 0; i <= EMA.length -1; i ++){
        EMA[i] = Number(EMA[i]).toFixed(2)
      }
    }
  
    return EMA
  }
  // green
export function FListValues(klines) {
    const listValues = [];
    if (Array.isArray(klines))
      klines.forEach((value, index) => {
        listValues.push(Number(value[4]));
      });
    return listValues;
  }
  // green
export function FStochRSI(values) {
    const srsi = TI.StochasticRSI;
    let SRSI = 0;
    if (values.length > 0) {
      SRSI = srsi.calculate({
        rsiPeriod: 14,
        stochasticPeriod: 14,
        kPeriod: 3,
        dPeriod: 3,
        values: values,
      });
      for(let i = 0; i <= SRSI.length -1; i ++){
        SRSI[i].stochRSI = Number(SRSI[i].stochRSI).toFixed(2)
        SRSI[i].k = Number(SRSI[i].k).toFixed(2)
        SRSI[i].d = Number(SRSI[i].d).toFixed(2)
        
      }
      stochRSIActual = SRSI[SRSI.length - 1];
      stochRSIActual.difKD = Number(stochRSIActual.k - stochRSIActual.d).toFixed(2);
      if (
        stochRSIActual.k > stochRSIActual.d &&
        stochRSIActual.d < 20 &&
        stochRSIActual.k < 20
      ) {
        crossDKRSI = true;
      } else if (
        stochRSIActual.k < stochRSIActual.d &&
        stochRSIActual.d > 80 &&
        stochRSIActual.k > 80
      ) {
        crossDKRSI = false;
      }
    }
  
    return SRSI;
  }
  // green
export function FMACD(values) {
    const macdt = TI.MACD;
    let MACDt = 0;
    if (values.length > 0) {
      MACDt = macdt.calculate({
        values: values,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });
      for(let i = 0; i <= MACDt.length -1; i ++){
        MACDt[i].MACD = Number(MACDt[i].MACD).toFixed(3)
        MACDt[i].histogram = Number(MACDt[i].histogram).toFixed(3)
        MACDt[i].signal = Number(MACDt[i].signal).toFixed(3)
      }
      const oldmacd = MACDt[MACDt.length - 2];
      actualMACD = MACDt[MACDt.length - 1];
      actualMACD.difHistogram = Number(oldmacd.histogram - actualMACD.histogram).toFixed(3);
      actualMACD.difMACDSignal = Number(actualMACD.MACD - actualMACD.signal).toFixed(3);
      actualMACD.histogram = `${actualMACD.histogram > 0 ? chalk.green("ﱢ") : chalk.red("ﱢ")} ${actualMACD.histogram}`
      if(actualMACD.difMACDSignal < 0){
        actualMACD.signal = `${chalk.red("")} ${chalk.green(" " + actualMACD.signal)}`
        actualMACD.MACD   = `${chalk.red("")} ${chalk.red(" " + actualMACD.MACD)}`
      }else{
        actualMACD.signal = `${chalk.green("")} ${chalk.red(" " + actualMACD.signal)}`
        actualMACD.MACD   = `${chalk.green("")} ${chalk.green(" " + actualMACD.MACD)}`
      }
      actualMACD.oldMACD = oldmacd.MACD;
    }
  
    return MACDt;
  }
  // green
export function FBollingerBand(values) {
    const bb = TI.BollingerBands;
    let BB = 0;
    if (values.length > 0) {
      BB = bb.calculate({
        period: 14,
        values: values,
        stdDev: 2,
      });
      for(let i = 0; i <= BB.length -1; i ++){
        BB[i].middle = Number(BB[i].middle).toFixed(2)
        BB[i].upper = Number(BB[i].upper).toFixed(2)
        BB[i].lower = Number(BB[i].lower).toFixed(2)
        BB[i].pb = Number(BB[i].pb).toFixed(2)
      }
      actualBB = BB[BB.length - 1];
    }
  
    return BB;
  }