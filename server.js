#!/usr/bin/env node

import express from "express";
import * as http from "http";
import "dotenv/config";

// inicial config
const app = express;
const server = http.createServer(app);
// modules
import { menu } from "./modules/gui.mjs";

server.listen(5000, () => {
  console.clear();
  menu();
});
