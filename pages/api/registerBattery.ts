import { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";
import AggregatorContract from "../../contracts/Aggregator.json";
import TSOContract from "../../contracts/TSO.json";
import { Battery } from "../../src/interfaces/batteryInterface";
import dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(process.env.HARDHAT_NETWORK_URL);
const aggregatorContractAddress = process.env.AGGREGATOR_CONTRACT_ADDRESS;
const tsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;

const defaultAccount = process.env.DEFAULT_ACCOUNT;
const tsoAdminAccount = process.env.TSO_ADMIN_ACCOUNT;
const onlyOneBattery: { [key: string]: number } = {};
const aggregatorContract = new web3.eth.Contract(
  AggregatorContract.abi,
  aggregatorContractAddress,
  { from: defaultAccount }
);
const tsoContract = new web3.eth.Contract(TSOContract.abi, tsoContractAddress, {
  from: tsoAdminAccount,
});

export default async function batteryHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { owner, capacity, SoC }: Battery = req.body;
  if (req.method === "POST") {
    try {
      if (
        aggregatorContract &&
        aggregatorContract.methods.registerBattery &&
        tsoContract &&
        tsoContract.methods.setAggregator
      ) {
        if (onlyOneBattery[owner] === 1) {
          res
            .status(400)
            .json({ error: "Battery already registered for this owner." });
        } else {
          const tx = await aggregatorContract.methods
            .registerBattery(owner, capacity, SoC)
            .send({ from: owner });
          onlyOneBattery[owner] = 1;

          await tsoContract.methods
            .setAggregator(owner, aggregatorContractAddress)
            .send({ from: tsoAdminAccount });

          res.status(200).json({
            message: "Battery registered successfully and aggregator set",
            txHash: tx.transactionHash,
          });
        }
      } else {
        res.status(500).json({
          error:
            "aggregatorContract or registerBattery method or tsoContract or setAggregator method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
