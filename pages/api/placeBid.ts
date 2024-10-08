import { NextApiRequest, NextApiResponse } from "next";
import { tsoContract, getAccounts } from "../../web3";
import fs from "fs";
import path from "path";

export default async function placeBidHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accounts = getAccounts();
  const aggregatorAdminAccount = accounts["Aggregator Admin"].address;

  const filePath = path.join(process.cwd(), "db", "bidsData.json");

  if (req.method === "POST") {
    try {
      // Leggi il file JSON delle bid
      const bidsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      for (const bid of bidsData) {
        const { batteryOwner, amountInKWh, pricePerMWh } = bid;

        if (tsoContract && tsoContract.methods.placeBid) {
          await tsoContract.methods
            .placeBid(batteryOwner, amountInKWh, pricePerMWh)
            .send({ from: aggregatorAdminAccount });
        }
      }

      res.json({ message: "Bids placed successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
