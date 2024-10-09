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

        // 2. Se la registrazione va a buon fine, scrivi i dati nel file JSON
        const newBid = {
          batteryOwner: batteryOwner,
          amountInKWh: amountInKWh,
          totalPrice: tx.events?.BidPlaced?.returnValues?.price || 0,
          txHash: tx.transactionHash,
        };

        let placedBids: any[] = [];
        if (fs.existsSync(filePath)) {
          // Leggi il file JSON esistente
          const fileData = fs.readFileSync(filePath, "utf-8");
          placedBids = JSON.parse(fileData);
        }

        // Aggiungi la nuova batteria
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
