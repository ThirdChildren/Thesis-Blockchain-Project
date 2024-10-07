import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";

export default async function placeBidHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    batteryOwner,
    amountInKWh,
    pricePerMWh,
  }: { batteryOwner: string; amountInKWh: number; pricePerMWh: number } =
    req.body;
  const accounts = getAccounts();
  const aggregatorAdminAccount = accounts["Aggregator Admin"].address;

  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.placeBid) {
        const tx = await tsoContract.methods
          .placeBid(batteryOwner, amountInKWh, pricePerMWh)
          .send({ from: aggregatorAdminAccount })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

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
