import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";
import fs from "fs";
import path from "path";

export default async function acceptBidHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

  try {
    if (tsoContract && tsoContract.methods.acceptBid) {
      const tx = await tsoContract.methods
        .acceptBid(bidId)
        .send({ from: tsoAdminAccount, value: totalPrice, gas: "3000000" })
        .on("receipt", async (tx) => {
          console.log(tx);

          // File path per acceptedBids.json
          const acceptedBidsPath = path.join(
            process.cwd(),
            "db",
            "acceptedBids.json"
          );

          // Preparazione dei dettagli della bid accettata
          const acceptedBid = {
            bidId: bid.bidId,
            batteryId: bid.batteryId,
            batteryOwner: bid.batteryOwner,
            amount: bid.amountInKWh,
            totalPrice: bid.totalPrice,
            txHash: tx.transactionHash,
          };

          // Aggiornamento o creazione di acceptedBids.json
          let acceptedBids = [];
          if (fs.existsSync(acceptedBidsPath)) {
            acceptedBids = JSON.parse(
              fs.readFileSync(acceptedBidsPath, "utf-8")
            );
          }

          acceptedBids.push(acceptedBid);
          fs.writeFileSync(
            acceptedBidsPath,
            JSON.stringify(acceptedBids, null, 2)
          );
        })
        .on("error", (error) => {
          console.log("error: ", error);
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
