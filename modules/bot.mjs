//module
import { binance } from "./node-binance-api.mjs";
import { FEMA, FListValues, FStochRSI, FMACD, FBollingerBand, getActualMACD, getActualBB, getStochRSIActual, getCrossDKRSI } from "./indicador.mjs"
import chalk from "chalk";

export let CRIPTOPAR = "ADAUSDT";
export let temporalidad = "1m";
export let testMode = true;
let botData = {};

let values = [];
let EMA12 = [];
let EMA26 = [];
let MACD = [];
let StochRSI = [];
let bollingerBand = [];

let ticker24h = {};
let difEMA = 0;

let bo = 0;
let bperc = 0;
let sellOrderList = [];
let buyOrderList = [];
let actualMountDisponible = 15;
let actualBTCDisponible = 0;
let takeProfit = 0;
let stopLoss = 0;
let stopLossPercent = 0.98;
let follow_up = 1.001;
let stoplossIncreaseQuantity = 0.01;
let lastCandlesticks = {};

export function getBotdata(){
  return botData;
}
export function getActualMount(){
  return actualMountDisponible;
}
export function setCRIPTOPAR(cp) {
  CRIPTOPAR = cp;
}
export function setTemporalidad(tp) {
  temporalidad = tp;
}
export function setTestMode(tm) {
  testMode = tm;
}
export function calculation() {
  return binance.candlesticks(CRIPTOPAR, temporalidad, function (error, ticks) {
      values = FListValues(ticks);
      EMA12 = FEMA(12, values)
      EMA26 = FEMA(26, values)
      MACD = FMACD(values);
      StochRSI = FStochRSI(values);
      bollingerBand = FBollingerBand(values);
      difEMA = EMA26[EMA26.length - 1] - EMA12[EMA12.length - 1];
      botData = {
        EMA1: EMA12[EMA12.length - 1],
        EMA2: EMA26[EMA26.length - 1],
        difEMA: difEMA,
        actualMACD: getActualMACD(),
        actualBB: getActualBB(),
        stochRSIActual: getStochRSIActual(),
        lastCandlesticks: lastCandlesticks[lastCandlesticks.length - 1],
        bo: bo,
        bperc: bperc,
        sellOrderList: sellOrderList,
        buyOrderList: buyOrderList,
        actualMountDisponible: `${chalk.yellow(actualMountDisponible)}`,
        stopLoss: stopLoss,
        takeProfit: takeProfit,
        actualBTCDisponible: actualBTCDisponible,
        crossDKRSI: getCrossDKRSI(),
        lastTricks: values[values.length - 1],
      };
    });
}
// green
function enabledBuyOrder() {
  let isEnabled = false;
  if (
    bo === 0 &&
    actualMountDisponible > 10 &&
    stochRSIActual.k >= 20 &&
    stochRSIActual.d >= 20 &&
    stochRSIActual.k <= 80 &&
    stochRSIActual.d <= 80 &&
    getCrossDKRSI() &&
    actualMACD.difHistogram < 0 &&
    lastCandlesticks.activate === 2
  )
    isEnabled = true;
  return isEnabled;
}
// green
// formas de usar if(enabledBuyOrder())
//                    buyOrder()

function buyOrder() {
  let buyPrice = 0;
  let relativePrice = 0;
  let mount = Number(actualMountDisponible).toFixed(0) - 1;
  actualMountDisponible -= mount;
  buyPrice = values[values.length - 1];
  relativePrice = mount / buyPrice;
  bo = buyPrice;
  takeProfit = bo * 1.01;
  stopLoss = bo * stopLossPercent;
  buyOrderList.push(Number(relativePrice).toFixed(2));
  if (!testMode) buyBinance(Number(relativePrice).toFixed(2));
}
// green
function buyOrderPercent() {
  let buyOrderPercent = 0;
  buyOrderPercent = ((ticker24h.close / bo) * 100) / 100;
  bperc = buyOrderPercent;
  if (buyOrderPercent > follow_up) {
    stopLossPercent += stoplossIncreaseQuantity;
    stopLoss = bo * stopLossPercent;
    follow_up += 0.001;
  }
}
function enabledSellOrder() {
  let isEnabled = false;

  if (
    (bo !== 0 && ticker24h.close >= takeProfit) ||
    (bo !== 0 && ticker24h.close <= stopLoss)
  )
    isEnabled = true;
  return isEnabled;
}
// green
// formas de usar if(enabledSellOrder())
//                    sellOrder()

function sellOrder() {
  let sellPrice = 0;
  sellPrice = Number(values[values.length - 1]);
  let relativePrice = 0;
  if (!testMode) sellBinance(actualBTCDisponible);
  bo = 0;
  bperc = 0;
  relativePrice = sellPrice * Number(buyOrderList[buyOrderList.length - 1]);
  sellOrderList.push(relativePrice);
  actualMountDisponible += relativePrice;
  actualBTCDisponible = 0;
  follow_up = 1.001;
  stopLoss = 0;
  takeProfit = 0;
  stopLossPercent = 0.98;
  // crossDKRSI = false;
}

async function buyBinance(mount) {
  try {
    await binance.marketBuy(CRIPTOPAR, mount).then((response) => {
      actualBTCDisponible = Number(response.executedQty);
    });
  } catch (error) {
    console.info(error);
  }
}
async function sellBinance(mount) {
  try {
    await binance.marketSell(CRIPTOPAR, mount).then();
    //balance
    binance.balance((error, balances) => {
      if (error) {
        return console.error(error);
        io.sockets.emit("apiBinance:Balance", error);
      }
      io.sockets.emit("apiBinance:Balance", balances);
      actualMountDisponible = Number(balances.USDT.available);
    });
  } catch (error) {
    console.info(error);
  }
}
