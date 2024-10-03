import express from "express";
import dotenv from "dotenv";
import Web3 from "web3";
import AggregatorContract from "../../contracts/Aggregator.json";
import TSOContract from "../../contracts/TSO.json";
import { Battery } from "./interfaces/batteryInterface";

dotenv.config();

const app = express();
const web3 = new Web3(process.env.HARDHAT_NETWORK_URL);

// Leggi gli indirizzi dei contratti dal file .env
const aggregatorContractAddress = process.env.AGGREGATOR_CONTRACT_ADDRESS;
const tsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;

// Inizializzazione del server e del contratto
(async () => {
  const accounts = await web3.eth.getAccounts();
  const defaultAccount = accounts[0];
  const tsoAccount = accounts[1];
  const onlyOneBattery: { [key: string]: number } = {};

  const aggregatorContract = new web3.eth.Contract(
    AggregatorContract.abi,
    aggregatorContractAddress,
    { from: defaultAccount }
  );

  const tsoContract = new web3.eth.Contract(
    TSOContract.abi,
    tsoContractAddress,
    { from: tsoAccount }
  );

  app.use(express.json());

  // API per registrare una batteria
  app.post("/registerBattery", async (req, res) => {
    const { owner, capacity, SoC }: Battery = req.body;

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

  // API per aprire il mercato
  app.post("/openMarket", async (req, res) => {
    const { requiredEnergy, isPositiveReserve } = req.body;

    try {
      if (tsoContract && tsoContract.methods.openMarket) {
        const tx = await tsoContract.methods
          .openMarket(requiredEnergy, isPositiveReserve)
          .send({ from: tsoAccount });

        res.json({
          message: "Market opened successfully",
          txHash: tx.transactionHash,
        });
      } else {
        res.status(500).json({
          error: "tsoContract or openMarket method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  });

  // Avvia il server
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
})();
