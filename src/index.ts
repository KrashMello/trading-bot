import express from 'express'
import 'dotenv/config'
import { Bot } from '@Modules/bot/index'

// inicial config
const app = express()
app.use(express.json())
// modules
// import { menu, loadingData } from "./modules/cli.mjs";
//
async function main() {
  console.clear()
  console.info('server started on http://localhost:5000')
  let bt = new Bot('daemon', 'LINK', 'USDT', 6)
  bt.getName
  // bt.start()  
  //
  // loadingData();
  // setTimeout(() => {
  //   menu();
  // }, 2000);
}

app.listen(process.env.SERVER_PORT, () => {
  main()
})
