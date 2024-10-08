import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";

export default async function closeMarketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accounts = getAccounts();
  const tsoAdminAccount = accounts["TSO Admin"].address;

  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.closeMarket) {
        const tx = await tsoContract.methods
          .closeMarket()
          .send({ from: tsoAdminAccount })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

        res.json({
          message: "Market closed successfully",
          txHash: tx.transactionHash,
        });
      } else {
        res.status(500).json({
          error: "tsoContract or tsoContract closeMarket method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
