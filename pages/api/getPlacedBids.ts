import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function getPlacedBids(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const filePath = path.join(process.cwd(), "db", "placedBids.json");

  // Leggi il file JSON
  try {
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const bids = JSON.parse(fileContents);

    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ error: "Error reading batteries data" });
  }
}
