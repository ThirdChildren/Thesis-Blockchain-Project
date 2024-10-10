import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";
import fs from "fs";
import path from "path";

export default async function acceptBidHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { bidId }: { bidId: number } = req.body;
  const accounts = getAccounts();
  const tsoAdminAccount = accounts["TSO Admin"].address;

  // Leggi il file placedBids.json per ottenere il prezzo della bid
  const filePath = path.join(process.cwd(), "db", "placedBids.json");
  const placedBids = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  // Trova la bid corrispondente
  const bid = placedBids.find((b: any) => b.bidId === bidId);
  if (!bid) {
    return res.status(400).json({ error: "Bid not found" });
  }

  const totalPrice = web3.utils.toWei(bid.totalPrice.toString(), "ether");

  if (req.method === "POST") {
    try {
      if (tsoContract && tsoContract.methods.acceptBid) {
        const tx = await tsoContract.methods
          .acceptBid(bidId)
          .send({ from: tsoAdminAccount, value: totalPrice, gas: "3000000" })
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
