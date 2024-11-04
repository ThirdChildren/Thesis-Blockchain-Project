import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";

export default async function openMarketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    requiredEnergy,
    isPositiveReserve,
  }: { requiredEnergy: number; isPositiveReserve: boolean } = req.body;
  const accounts = getAccounts();
  const tsoAdminAccount = accounts["TSO Admin"].address;

  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.openMarket) {
        console.log("Opening market with positive reserve:", isPositiveReserve);
        console.log("Required energy:", requiredEnergy);
        const tx = await tsoContract.methods
          .openMarket(requiredEnergy, isPositiveReserve)
          .send({ from: tsoAdminAccount })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

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
