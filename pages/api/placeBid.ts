import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";
import fs from "fs";
import path from "path";

// Paths for JSON files
const bidsFilePath = path.join(process.cwd(), "db", "placedBids.json");
const lastBidIdPath = path.join(process.cwd(), "db", "lastBidId.json");

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
        console.log("Placing bid for battery owner:", batteryOwner);

        const tx = await tsoContract.methods
          .placeBid(batteryOwner, amountInKWh, pricePerMWh)
          .send({ from: aggregatorAdminAccount })
          .on("receipt", (tx) => {
            console.log(tx);
          })
          .on("error", (error) => {
            console.log("error: ", error);
          });

        // Retrieve the last bidId from lastBidId.json
        let newBidId = -1;
        if (fs.existsSync(lastBidIdPath)) {
          const lastBidIdData = fs.readFileSync(lastBidIdPath, "utf-8");
          newBidId = JSON.parse(lastBidIdData).lastBidId + 1;
        }

        // Create the new bid with an incremental bidId
        const newBid = {
          bidId: newBidId,
          batteryOwner: batteryOwner,
          amountInKWh: amountInKWh,
          totalPrice:
            Math.round(((amountInKWh * pricePerMWh) / 1000) * 100) / 100,
          txHash: tx.transactionHash,
        };

        // Read the existing placedBids.json file
        let placedBids = [];
        if (fs.existsSync(bidsFilePath)) {
          const fileData = fs.readFileSync(bidsFilePath, "utf-8");
          placedBids = JSON.parse(fileData);
        }

        // Add the new bid to the array and save to placedBids.json
        placedBids.push(newBid);
        fs.writeFileSync(
          bidsFilePath,
          JSON.stringify(placedBids, null, 2),
          "utf-8"
        );

        // Update the lastBidId in lastBidId.json
        fs.writeFileSync(
          lastBidIdPath,
          JSON.stringify({ lastBidId: newBidId }, null, 2),
          "utf-8"
        );

        res.json({
          message: "Bid placed successfully",
          txHash: tx.transactionHash,
          bidId: newBidId,
        });
      } else {
        res.status(500).json({
          error: "tsoContract or tsoContract placeBid method is undefined",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: (error as any).message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
