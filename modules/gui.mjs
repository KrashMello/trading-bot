import {
  calculation,
  getBotdata,
  setCRIPTOPAR,
  CRIPTOPAR,
  setTemporalidad,
  temporalidad,
  setTestMode,
  testMode,
  getActualMount
} from "./bot.mjs";
import chalk from "chalk";
import readline from "readline";
import { binance } from "./node-binance-api.mjs";

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: `Option ${chalk.yellow(" =>")}  `,
});

let botInterval = undefined;
let showbotInterval = undefined;
let botEnabled = false;
let menuID = "-1";

const temporalityList = `select temporality:\n
  1${chalk.yellow(" =>")} 1m   10${chalk.yellow(" =>")} 8h
  2${chalk.yellow(" =>")} 3m   11${chalk.yellow(" =>")} 12h
  3${chalk.yellow(" =>")} 5m   12${chalk.yellow(" =>")} 1d
  4${chalk.yellow(" =>")} 15m  13${chalk.yellow(" =>")} 1w
  5${chalk.yellow(" =>")} 30   14${chalk.yellow(" =>")} 1M
  6${chalk.yellow(" =>")} 1h
  7${chalk.yellow(" =>")} 2h
  8${chalk.yellow(" =>")} 4h
  9${chalk.yellow(" =>")} 6h 
  0${chalk.magenta(" =>")} go back\n
Option ${chalk.yellow(" =>")}`;

function header(wString = false) {
  const header = `******************************************************
*                                                    *
*                    Bot trading                     *
*                                     by: krahsmello *
******************************************************
test:  ${testMode ? chalk.greenBright("") : chalk.red("")} | bot started:  ${
    botEnabled ? chalk.greenBright("") : chalk.red("")
  } | ActualUSDT: ${getActualMount()} | temporality: ${temporalidad} | par: ${CRIPTOPAR}`;
  if (!wString) return console.log(chalk.blue(header + "\n\n"));
  else return header + "\n\n";
}
function separator() {
  return console.log(
    "________________________________________________________\n"
  );
}
function menuList() {
  return `select any option:\n
  1${chalk.yellow(" =>")} change temporality
  2${chalk.yellow(" =>")} show temporality
  3${chalk.yellow(" =>")} change par
  4${chalk.yellow(" =>")} show par
  5${chalk.yellow(" =>")} change test mode
  6${chalk.yellow(" =>")} balance
  7${chalk.yellow(" =>")} ${
    botEnabled ? chalk.green("") : chalk.red("")
  } trading bot
  8${chalk.yellow(" =>")} show trading bot
  0${chalk.yellow(" =>")} exit\n`;
}
function responsiveTableForObject(columsNames = ["default"] ,data = [{},{}], columnWidth = 30,showSeparation = false){
  // ┌─────────┬─────┐
  // │    a    │  b  │
  // ├─────────┼─────┤
  // │    0    │  1  │
  // │    1    │ 'Z' │
  // └─────────┴─────┘

  if(columsNames.length === data.length)
  {
    let separator

    if(!showSeparation){
      separator = " "
    }else{
      separator = "."
    }

    let re = /(\x1B\[\b\d+m\b)/g; // /*\x1B[31mﱢ\x1B[39m*/
    
    let table = new Object()
    let rows = {}
    let rowSize = 0;
    let temp = ""
    columsNames.forEach((colums,cn)=>{
      rows.keys = Object.keys(data[cn])
      rows.values = Object.values(data[cn])
      table[colums] = new Array()
      rows.keys.forEach((keys,r) => {
        temp = ""
        if(re.test(rows.values[r])){
          temp = rows.values[r].replace(re,"")
          table[colums].push(rows.keys[r]+ ":" + separator.repeat(columnWidth-(rows.keys[r].length + temp.length) - 1) + rows.values[r])

        }else {
          table[colums].push(rows.keys[r]+ ":" + separator.repeat(columnWidth-(rows.keys[r].length+rows.values[r].length) - 1) + rows.values[r])
        }
      })
    })
    temp = ""
    for(const columns in table){
      temp += " " + columns + separator.repeat(columnWidth-columns.length)
      if(table[columns].length > rowSize){
        rowSize = table[columns].length
      }
    }
    table["header"] = new String()
    table["header"] = temp
    for(let r = -1 ; r < rowSize; r++){
      temp = ""
      if(r === -1){
          console.log(table["header"]+"\n"+ "─".repeat(columnWidth*columsNames.length+columsNames.length*2-2))
      }else{
        for(let c = 0; c < Object.values(table).length; c++){
          if(c !== 3)
              if(Object.values(table)[c][r] === undefined)
                temp += separator.repeat(columnWidth) + "│ "
              else
                temp += Object.values(table)[c][r] + "│ "
            if(c === 2)
              console.log(temp) 
        }
      }
    }
    console.log("─".repeat(columnWidth*columsNames.length+columsNames.length*2-2))
    //console.log(table)
  }else{
    console.log("error")
  }
}
export function menu(disableConsoleClear = false) {
  if (!disableConsoleClear) {
    console.clear();
    header();
  }
  console.log(menuList());
  rl.prompt();
  rl.on("line", (menu) => {
    menuID = menu;
    console.clear();
    header();
    switch (menu.trim()) {
      case "0":
        rl.close();
        break;
      case "1":
        if(botEnabled){
          separator()
          console.log("the bot need be off to realice this action")
          separator()
          console.log(menuList())
          rl.prompt();
        }else{
          changeTemporality();
        }
        break;
      case "2":
        separator();
        console.log("temporality selected is: " + temporalidad + "\n");
        separator();
        break;
      case "3":
        if(botEnabled){
          separator()
          console.log("the bot need be off to realice this action")
          separator()
          console.log(menuList())
          rl.prompt();
        }else{
          header(true);
          rl.question("Insert the Par > ", (input) => {
            setCRIPTOPAR(input.toUpperCase());
            repaintMenu("The new par is: " + CRIPTOPAR)
          });
        }
        
        break;
      case "4":
        separator();
        console.log(`CRIPTOPAR selected is: ${CRIPTOPAR}\n`);
        separator();
        break;
      case "5":
        header(true);
        rl.question(
          "Are you sure you want change test mode? y/n > ",
          (input) => {
            if (input.match(/^y(es)?$/i)) {
              console.clear();
              setTestMode(!testMode);
              header();
              console.log(menuList());
              rl.prompt();
            } else {
              console.clear();
              header();
              console.log(menuList());
              rl.prompt();
            }
          }
        );
        break;
      case "6":
        console.clear();
        header();
        separator();
        console.log("loading....");
        separator();
        console.log(menuList());
        rl.prompt();
        balanceAccount();
        break;
      case "7":
        separator();
        console.log("loading....");
        separator();
        if (botEnabled === true) {
          clearInterval(showbotInterval);
          clearInterval(botInterval);
          showbotInterval = undefined
          botInterval = undefined
        }
        botEnabled = !botEnabled;
        startBot(botEnabled);
        break;
      case "8":
        console.clear();
        startBot(botEnabled)
        break;
      default:
        separator();
        console.error("invalid option\n");
        separator();
        break;
    }
    if (
      Number(menu) !== 1 &&
      Number(menu) !== 3 &&
      Number(menu) !== 5 &&
      Number(menu) !== 6
    ) {
      console.log(menuList());
      rl.prompt();
    }
  }).on("close", () => {
    console.clear();
    header();
    separator();
    console.log("Have a great day!");
    separator();
    process.exit(0);
  });
}

async function balanceAccount() {
  await binance.balance((error, balances) => {
    for (const bname in balances) {
      balances[bname].name = bname;
    }
    console.clear();
    if (error !== null) {
      header();
      console.error(error);
      console.log(menuList());
      rl.prompt();
    } else {
      header();
      separator();
      console.table(
        [
          balances.USDT,
          balances.BUSD,
          balances.ADA,
          balances.BNB,
          balances.BTC,
          balances.ETH,
        ],
        ["name", "available", "onOrder"]
      );
      separator();
      console.log(menuList());
      rl.prompt();

      // actualMountDisponible = Number(balances.USDT.available);
    }
  });
}

function changeTemporality() {
  console.clear();
  header()
  rl.question(temporalityList, (input) => {
    switch (input.trim()) {
      case "0":
        break;
      case "1":
        setTemporalidad("1m");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "2":
        setTemporalidad("3m");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "3":
        setTemporalidad("5m");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "4":
        setTemporalidad("15m");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "5":
        setTemporalidad("30m");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "6":
        setTemporalidad("1h");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "7":
        setTemporalidad("2h");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "8":
        setTemporalidad("4h");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "9":
        setTemporalidad("6h");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "10":
        setTemporalidad("8h");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "11":
        setTemporalidad("12h");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "12":
        setTemporalidad("1d");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "13":
        setTemporalidad("1w");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      case "14":
        setTemporalidad("1M");
        repaintMenu("The temporality is: " + temporalidad)
        break;
      default:
        console.clear();
        header();
        separator();
        console.error("invalid option\n");
        separator();
        console.log(temporalityList);
        break;
    }
  });
}

function startBot(enable) {
  if (!enable) {
    console.clear();
    header();
    separator();
    console.log("Bot Disabled.");
    separator();
  } else {
    console.clear();
    header();
    separator();
    console.log("Bot Enabled.");
    separator();
    if(botInterval === undefined)
      botInterval = setInterval(async () => {
          await calculation();
        },2000)

    if (showbotInterval === undefined) {
      showbotInterval = setInterval(() => {
        if(Number(menuID) === 8 )
          {console.clear();
          header();
          separator();
          if(getBotdata().hasOwnProperty("actualMACD")){
            console.log("actual price: " + chalk.yellow(getBotdata().lastTricks) + "\n")
            responsiveTableForObject(["actualMACD", "actualBB", "stochRSIActual"],[getBotdata().actualMACD,getBotdata().actualBB,getBotdata().stochRSIActual])
          }else{
            console.log("loading....");
          }
          separator();
          console.log(menuList());
          rl.prompt();}
        },2000)
    }else if (Number(menuID) === 8 && showbotInterval !== undefined){
      showbotInterval
    }
    
  }
}

function repaintMenu(message = "hello world!"){
  console.clear()
  header();
  separator()
  console.log(message)
  separator()
  console.log(menuList());
  rl.prompt();
}
