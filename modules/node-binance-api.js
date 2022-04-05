import Binance from "node-binance-api";
export const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
});

export function sayHi(name) {
  return "Hi, " + name + "!";
}
