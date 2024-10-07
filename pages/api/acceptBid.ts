import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";

export default async function acceptBidHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { bidId }: { bidId: number } = req.body;
  const accounts = getAccounts();
  const tsoAdminAccount = accounts["TSO Admin"].address;

  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.acceptBid) {
        const tx = await tsoContract.methods
          .acceptBid(bidId)
          .send({ from: tsoAdminAccount })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

        res.json({
          message: "Bid selected successfully",
          txHash: tx.transactionHash,
        });
      } else {
        res.status(500).json({
          error: "tsoContract or tsoContract acceptBid method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
