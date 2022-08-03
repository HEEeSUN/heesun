import express from "express";
import dotenv from "dotenv";
import initLoaders from "./loaders/index.js"

async function startServer() {
  const app = express();
  const server = app.listen(parseInt(process.env.PORT));
  await initLoaders({ server, expressApp: app });
  console.log("- server is started -");
}

dotenv.config();
startServer();






