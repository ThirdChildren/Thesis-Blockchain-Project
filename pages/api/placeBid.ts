import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";
import fs from "fs";
import path from "path";

// Percorso del file JSON per salvare le bids piazzate
const filePath = path.join(process.cwd(), "db", "placedBids.json");

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

        // Leggi il file JSON per ottenere l'ultimo bidId
        let placedBids: any[] = [];
        let newBidId = 1; // Default bidId se il file è vuoto
        if (fs.existsSync(filePath)) {
          const fileData = fs.readFileSync(filePath, "utf-8");
          placedBids = JSON.parse(fileData);
          if (placedBids.length > 0) {
            // Prendi l'ultimo bidId e incrementalo
            const lastBid = placedBids[placedBids.length - 1];
            newBidId = lastBid.bidId + 1;
          }
        }

        // Crea la nuova bid con un bidId incrementale
        const newBid = {
          bidId: newBidId, // Aggiungi il campo bidId incrementale
          batteryOwner: batteryOwner,
          amountInKWh: amountInKWh,
          totalPrice:
            Math.round(((amountInKWh * pricePerMWh) / 1000) * 100) / 100,
          txHash: tx.transactionHash,
        };

        // Aggiungi la nuova bid all'array esistente
        placedBids.push(newBid);

        // Scrivi i dati aggiornati nel file JSON
        fs.writeFileSync(
          filePath,
          JSON.stringify(placedBids, null, 2),
          "utf-8"
        );

        res.json({
          message: "Bid placed successfully",
          txHash: tx.transactionHash,
          bidId: newBidId, // Restituisci anche il bidId
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
