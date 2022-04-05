// rl.setPrompt("insert the PAR");
  // rl.prompt();
  // rl.on('line', (PAR) => {

  //     console.log(`the par is: ${PAR}`);
  //     rl.close();
  // });

  // rl.on('SIGINT', () => {
  //   rl.question('Can you Exit (y or n)? ', (input) => {
  //     if (input.match(/^y(es)?$/i)) {
  //       console.log("\nexit...\n")
  //       rl.pause();
  //     }
  //     });
  // });
  // setInterval(() => {
  //   //balance
  // binance.balance((error, balances) => {
  //   if (error) {
  //     return console.error(error);
  //   }
  //   console.log(balances.USDT.available);
  //   actualMountDisponible = Number(balances.USDT.available);
  // });

  //   //chequear todas las ordenes de compra venta
  //   binance.allOrders(CRIPTOPAR, (error, orders, symbol) => {
  //     io.sockets.emit("apiBinance:allOrders", orders);
  //   });
  // }, 5000);
  // binance.futuresChart(CRIPTOPAR, TEMPORALITY, (symbol, interval, chart) => {
  //   chart = Object.values(chart);
  //   lastCandlesticks = strengthCandlesticks(chart);
  //   console.clear;
  //   console.log(lastCandlesticks[lastCandlesticks.length - 1]);
  // });
  // setInterval(() => {
  //   //calcular funciones del bot
  //   binance.candlesticks(CRIPTOPAR, TEMPORALITY, function (error, ticks) {
  //     values = FListValues(ticks);
  //     EMA12 = FEMA(12, values);
  //     EMA26 = FEMA(26, values);
  //     MACD = FMACD(values);
  //     StochRSI = FStochRSI(values);
  //     bollingerBand = FBollingerBand(values);
  //     difEMA = EMA26[EMA26.length - 1] - EMA12[EMA12.length - 1];
  //     data = {
  //       EMA1: EMA12[EMA12.length - 1],
  //       EMA2: EMA26[EMA26.length - 1],
  //       difEMA: difEMA,
  //       actualMACD: actualMACD,
  //       actualBB: actualBB,
  //       stochRSIActual: stochRSIActual,
  //       actualMACD: actualMACD,
  //       lastCandlesticks: lastCandlesticks[lastCandlesticks.length - 1],
  //       bo: bo,
  //       bperc: bperc,
  //       sellOrderList: sellOrderList,
  //       buyOrderList: buyOrderList,
  //       actualMountDisponible: actualMountDisponible,
  //       stopLoss: stopLoss,
  //       takeProfit: takeProfit,
  //       actualBTCDisponible: actualBTCDisponible,
  //       crossDKRSI: crossDKRSI,
  //     };

  //     console.clear();
  //     console.info(data);
  //     io.sockets.emit("apiBinance:data", data);
  //   });

  //   //funciones extras
  //   if (enabledBuyOrder()) buyOrder();
  //   if (enabledSellOrder()) sellOrder();
  //   if (bo !== 0) buyOrderPercent();
  // }, 500);
  // binance.websockets.chart(
  //   CRIPTOPAR,
  //   TEMPORALITY,
  //   (symbol, interval, chart) => {
  //     // let tick = binance.last(chart);
  //     // const last = chart[tick].close;
  //     console.log(chart);
  //     // chart = Object.values(chart);
  //     // lastCandlesticks = strengthCandlesticks(chart);

  //     // Optionally convert 'chart' object to array:
  //     // let ohlc = binance.ohlc(chart);
  //     // console.info(symbol, ohlc);
  //   }
  // );
  // binance.websockets.prevDay(CRIPTOPAR, (error, response) => {
  //   ticker24h = response;
  //   io.sockets.emit("apiBinance:ticker24h", {
  //     ticker24h: response,
  //   });
  // });