import { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";
import TsoContract from "../../contracts/TSO.json";
import dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(process.env.HARDHAT_NETWORK_URL);
const TsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;

const tsoAdminAccount = process.env.TSO_ADMIN_ACCOUNT;
const tsoContract = new web3.eth.Contract(TsoContract.abi, TsoContractAddress, {
  from: tsoAdminAccount,
});

export default async function openMarketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { requiredEnergy, isPositiveReserve } = req.body;
  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.openMarket) {
        const tx = await tsoContract.methods
          .openMarket(requiredEnergy, isPositiveReserve)
          .send({ from: tsoAdminAccount });

        res.json({
          message: "Market opened successfully",
          txHash: tx.transactionHash,
        });
      } else {
        res.status(500).json({
          error: "tsoContract or tsoContract openMarket method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
