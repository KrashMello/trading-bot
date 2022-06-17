//module
import { binance } from "./node-binance-api.mjs";
import {
    FEMA,
    extractDataToKlines,
    FStochRSI,
    FMACD,
    FBollingerBand,
} from "./indicador.mjs";
import * as mysql from "./mysql.mjs";

import chalk from "chalk";

export let CRIPTOPAR = "ADAUSDT";
export let temporality = "1m";
export let testMode = true;
let actualMountDisponible = 15.1632;

let data1 = {};
let data2 = {};

let values = [];

let ticker24h = {};

let bo = 0;
let bperc = 0;
let sellOrderList = [];
export let buyOrderList = [];
let actualBTCDisponible = 0;
let takeProfit = 0;
let stopLoss = 0;
let stopLossPercent = 0.98;
let follow_up = 1.001;
let stoplossIncreaseQuantity = 0.01;
let lastCandlesticks = {};

let arrayPrice_1 = [];
let actualPrice_1 = 0;
let MACD_1 = [];
let StochRSI_1 = [];
let bollingerBand_1 = [];
let actualBB_1 = {};
let actualSRSI_1 = {};
let actualMACD_1 = {};
let rsiIndicatorB_1 = false;
let BBIndicatorB_1 = false;
let MACDIndicatorB_1 = false;
let rsiIndicatorS_1 = false;
let BBIndicatorS_1 = false;
let MACDIndicatorS_1 = false;

let arrayPrice_2 = [];
let actualPrice_2 = 0;
let MACD_2 = [];
let StochRSI_2 = [];
let bollingerBand_2 = [];
let actualBB_2 = {};
let actualSRSI_2 = {};
let actualMACD_2 = {};
let rsiIndicatorB_2 = false;
let BBIndicatorB_2 = false;
let MACDIndicatorB_2 = false;
let rsiIndicatorS_2 = false;
let BBIndicatorS_2 = false;
let MACDIndicatorS_2 = false;

//#region export getters and setters
export function getBotdata() {
    return { data1: data1, data2: data2 };
}
export function setBO(tbo) {
    bo = tbo;
}
export function getBO() {
    return bo;
}
export function getActualMount() {
    return actualMountDisponible;
}
export function setActualMount(am) {
    actualMountDisponible = am;
}
export function setCRIPTOPAR(cp) {
    CRIPTOPAR = cp;
}
export function setTemporality(tp) {
    temporality = tp;
}
export function setTestMode(tm) {
    testMode = tm;
}
//#endregion calculation
export async function calculation() {
    await binance.candlesticks(CRIPTOPAR, temporality, (error, ticks) => {
        if (Array.isArray(ticks)) {
            arrayPrice_1 = extractDataToKlines(ticks);
            actualPrice_1 = arrayPrice_1[arrayPrice_1.length - 1];

            MACD_1 = FMACD(arrayPrice_1);
            StochRSI_1 = FStochRSI(arrayPrice_1);
            bollingerBand_1 = FBollingerBand(arrayPrice_1);

            actualBB_1 = bollingerBand_1[bollingerBand_1.length - 1];
            actualSRSI_1 = StochRSI_1[StochRSI_1.length - 1];
            actualMACD_1 = MACD_1[MACD_1.length - 1];
            //#region buy
            if (
                Number(actualSRSI_1.k) < 20 &&
                Number(actualSRSI_1.d) < 20 &&
                Number(actualSRSI_1.k) >= Number(actualSRSI_1.d)
            )
                rsiIndicatorB_1 = true;
            else rsiIndicatorB_1 = false;
            if (
                Number(actualPrice_1) > Number(actualBB_1.lower) &&
                Number(actualPrice_1) < Number(actualBB_1.middle)
            )
                BBIndicatorB_1 = true;
            else BBIndicatorB_1 = false;
            if (Number(actualMACD_1.MACD) <= Number(actualMACD_1.signal))
                MACDIndicatorB_1 = true;
            else MACDIndicatorB_1 = false;
            //#endregion
            //#region sell
            if (
                Number(actualSRSI_1.k) > 80 &&
                Number(actualSRSI_1.k) <= Number(actualSRSI_1.d)
            )
                rsiIndicatorS_1 = true;
            else rsiIndicatorS_1 = false;
            if (
                (Number(actualPrice_1) > Number(actualBB_1.lower) &&
                    Number(actualPrice_1) < Number(actualBB_1.upper)) ||
                Number(actualPrice_1) >= Number(actualBB_1.upper)
            )
                BBIndicatorS_1 = true;
            else BBIndicatorS_1 = false;
            if (Number(actualMACD_1.MACD) > Number(actualMACD_1.signal))
                MACDIndicatorS_1 = true;
            else MACDIndicatorS_1 = false;
            //#endregion
            data1 = {
                k: actualSRSI_1.k,
                d: actualSRSI_1.d,
                MACD: actualMACD_1.MACD,
                signal: actualMACD_1.signal,
                rsiIndicatorB: `${
                    rsiIndicatorB_1
                        ? chalk.green(" " + rsiIndicatorB_1)
                        : chalk.red(" " + rsiIndicatorB_1)
                } `,
                BBIndicatorB: `${
                    BBIndicatorB_1
                        ? chalk.green(" " + BBIndicatorB_1)
                        : chalk.red(" " + BBIndicatorB_1)
                } `,
                MACDIndicatorB: `${
                    MACDIndicatorB_1
                        ? chalk.green(" " + MACDIndicatorB_1)
                        : chalk.red(" " + MACDIndicatorB_1)
                } `,
                rsiIndicatorS: `${
                    rsiIndicatorS_1
                        ? chalk.green(" " + rsiIndicatorS_1)
                        : chalk.red(" " + rsiIndicatorS_1)
                } `,
                BBIndicatorS: `${
                    BBIndicatorS_1
                        ? chalk.green(" " + BBIndicatorS_1)
                        : chalk.red(" " + BBIndicatorS_1)
                } `,
                MACDIndicatorS: `${
                    MACDIndicatorS_1
                        ? chalk.green(" " + MACDIndicatorS_1)
                        : chalk.red(" " + MACDIndicatorS_1)
                } `,
                actualPrice: actualPrice_1,
            };
        }
    });
    await binance.candlesticks(CRIPTOPAR, "1m", (error, ticks) => {
        if (Array.isArray(ticks)) {
            arrayPrice_2 = extractDataToKlines(ticks);
            actualPrice_2 = arrayPrice_2[arrayPrice_2.length - 1];

            MACD_2 = FMACD(arrayPrice_2);
            StochRSI_2 = FStochRSI(arrayPrice_2);
            bollingerBand_2 = FBollingerBand(arrayPrice_2);

            actualBB_2 = bollingerBand_2[bollingerBand_2.length - 1];
            actualSRSI_2 = StochRSI_2[StochRSI_2.length - 1];
            actualMACD_2 = MACD_2[MACD_2.length - 1];
            //#region Buy
            if (
                Number(actualSRSI_2.k) > 80 &&
                Number(actualSRSI_2.k) >= Number(actualSRSI_2.d)
            )
                rsiIndicatorB_2 = true;
            else rsiIndicatorB_2 = false;

            if (
                (Number(actualPrice_2) > Number(actualBB_2.lower) &&
                    Number(actualPrice_2) < Number(actualBB_2.middle)) ||
                Number(actualPrice_2) < Number(actualBB_2.lower)
            )
                BBIndicatorB_2 = true;
            else BBIndicatorB_2 = true;
            if (Number(actualMACD_2.MACD) > Number(actualMACD_2.signal))
                MACDIndicatorB_2 = true;
            else MACDIndicatorB_2 = false;

            //#endregion
            //#region Sell
            if (
                Number(actualSRSI_2.k) < 35 &&
                Number(actualSRSI_2.d) < 35 &&
                Number(actualSRSI_2.k) <= Number(actualSRSI_2.d)
            )
                rsiIndicatorS_2 = true;
            else rsiIndicatorS_2 = false;

            if (
                Number(actualPrice_2) > Number(actualBB_2.lower) &&
                Number(actualPrice_2) < actualBB_2.middle
            )
                BBIndicatorS_2 = true;
            else BBIndicatorS_2 = false;
            if (Number(actualMACD_2.MACD) < Number(actualMACD_2.signal))
                MACDIndicatorS_2 = true;
            else MACDIndicatorS_2 = false;
            //#endregion
            data2 = {
                k: actualSRSI_2.k,
                d: actualSRSI_2.d,
                MACD: actualMACD_2.MACD,
                signal: actualMACD_2.signal,
                rsiIndicatorB: `${
                    rsiIndicatorB_2
                        ? chalk.green(" " + rsiIndicatorB_2)
                        : chalk.red(" " + rsiIndicatorB_2)
                } `,
                BBIndicatorB: `${
                    BBIndicatorB_2
                        ? chalk.green(" " + BBIndicatorB_2)
                        : chalk.red(" " + BBIndicatorB_2)
                } `,
                MACDIndicatorB: `${
                    MACDIndicatorB_2
                        ? chalk.green(" " + MACDIndicatorB_2)
                        : chalk.red(" " + MACDIndicatorB_2)
                } `,
                rsiIndicatorS: `${
                    rsiIndicatorS_2
                        ? chalk.green(" " + rsiIndicatorS_2)
                        : chalk.red(" " + rsiIndicatorS_2)
                } `,
                BBIndicatorS: `${
                    BBIndicatorS_2
                        ? chalk.green(" " + BBIndicatorS_2)
                        : chalk.red(" " + BBIndicatorS_2)
                } `,
                MACDIndicatorS: `${
                    MACDIndicatorS_2
                        ? chalk.green(" " + MACDIndicatorS_2)
                        : chalk.red(" " + MACDIndicatorS_2)
                } `,
                actualPrice: actualPrice_2,
            };
        }
    });
    if (enabledTheBuyOrder()) {
        buyOrder();
    } else if (enabledSellOrder()) sellOrder();

    if (bo !== 0) buyOrderPercent();
}
//#region all action the bot
function enabledTheBuyOrder() {
    if (
        bo === 0 &&
        rsiIndicatorB_1 === true &&
        BBIndicatorB_1 === true &&
        MACDIndicatorB_1 === true &&
        rsiIndicatorB_2 === true &&
        BBIndicatorB_2 === true &&
        MACDIndicatorB_2 === true
    )
        return true;
    else return false;
}

function buyOrder() {
    let buyPrice = 0;
    let relativePrice = 0;
    let mount = Number(actualMountDisponible).toFixed(0) - 1;
    actualMountDisponible -= mount;

    buyPrice = data1.actualPrice;
    relativePrice = mount / buyPrice;

    mysql.insert_order(
        buyPrice,
        relativePrice,
        CRIPTOPAR,
        (response, error) => {
            if (error) {
                return mysql.connection.rollback(function () {
                    throw error;
                });
            }
            mysql.connection.commit(function (err) {
                if (err) {
                    return mysql.connection.rollback(function () {
                        throw err;
                    });
                }
            });
        }
    );

    bo = buyPrice;
    //takeProfit = bo * 1.01;
    //stopLoss = bo * stopLossPercent;
    buyOrderList.push({
        buyPrice: buyPrice,
        mountBuy: Number(relativePrice).toFixed(2),
        status: 1,
    });
    if (!testMode) buyBinance(Number(relativePrice).toFixed(2));
}
// green
function buyOrderPercent() {
    let buyOrderPercent = 0;
    buyOrderPercent = ((data1.actualPrice / bo) * 100) / 100;
    bperc = buyOrderPercent;
    // if (buyOrderPercent > follow_up) {
    //   stopLossPercent += stoplossIncreaseQuantity;
    //   stopLoss = bo * stopLossPercent;
    //   follow_up += 0.001;
    // }
}
function enabledSellOrder() {
    if (
        bo !== 0 &&
        rsiIndicatorS_1 === true &&
        BBIndicatorS_1 === true &&
        MACDIndicatorS_1 === true &&
        rsiIndicatorS_2 === true &&
        BBIndicatorS_2 === true &&
        MACDIndicatorS_2 === true
    )
        return true;
    else return false;
}
// green
// formas de usar if(enabledSellOrder())
//                    sellOrder()

function sellOrder() {
    let sellPrice = 0;
    let relativePrice = 0;

    sellPrice = data1.actualPrice;
    mysql.update_order(sellPrice, (response, error) => {
        if (error) {
            return mysql.connection.rollback(function () {
                throw error;
            });
        }
        mysql.connection.commit(function (err) {
            if (err) {
                return mysql.connection.rollback(function () {
                    throw err;
                });
            }
        });
    });
    if (!testMode) sellBinance(actualBTCDisponible);
    bo = 0;
    bperc = 0;
    relativePrice =
        sellPrice * Number(buyOrderList[buyOrderList.length - 1].mountBuy);
    sellOrderList.push(relativePrice);
    actualMountDisponible += relativePrice;
    // actualBTCDisponible = 0;
    // follow_up = 1.001;
    // stopLoss = 0;
    // takeProfit = 0;
    // stopLossPercent = 0.98;
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
        console.log(error);
    }
}
//#endregion
