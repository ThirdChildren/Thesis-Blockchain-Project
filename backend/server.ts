const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const express = require("express");
const { Web3 } = require("web3");
const AggregatorContract = require("../contracts/Aggregator.json");
const TSOContract = require("../contracts/TSO.json");
const dotenv = require("dotenv");

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const web3 = new Web3("http://localhost:8545");

app.prepare().then(async () => {
  const server = express();

  // Tuo codice Express esistente
  const aggregatorContractAddress = process.env.AGGREGATOR_CONTRACT_ADDRESS;
  const tsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const onlyOneBattery: { [key: string]: number } = {};

  const aggregatorContract = new web3.eth.Contract(
    AggregatorContract.abi,
    aggregatorContractAddress,
    {
      from: defaultAccount,
    }
  );

  server.use(express.json());

  server.post("/registerBattery", async (req: any, res: any) => {
    const { owner, capacity, SoC } = req.body;

    try {
      if (aggregatorContract && aggregatorContract.methods.registerBattery) {
        if (onlyOneBattery[owner] === 1) {
          res
            .status(400)
            .json({ error: "Battery already registered for this owner." });
        } else {
          const tx = await aggregatorContract.methods
            .registerBattery(owner, capacity, SoC)
            .send({ from: owner });
          onlyOneBattery[owner] = 1;

          res.json({
            message: "Battery registered successfully",
            txHash: tx.transactionHash,
          });
        }
      } else {
        res.status(500).json({
          error: "aggregatorContract or registerBattery method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  });

  // Passa le richieste di Next.js
  server.all("*", (req: any, res: any) => {
    const parsedUrl = parse(req.url!, true);
    return handle(req, res, parsedUrl);
  });

  // Avvia il server
  createServer(server).listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
