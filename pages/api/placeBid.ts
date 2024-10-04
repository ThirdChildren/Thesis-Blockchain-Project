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

export default async function placeBidHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { bidder, batteryOwner, amountInKWh, pricePerMWh } = req.body;
  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.placeBid) {
        const tx = await tsoContract.methods
          .placeBid(bidder, batteryOwner, amountInKWh, pricePerMWh)
          .send({ from: bidder });

        res.json({
          message: "Bid placed successfully",
          txHash: tx.transactionHash,
        });
      } else {
        res.status(500).json({
          error: "tsoContract or tsoContract placeBid method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
