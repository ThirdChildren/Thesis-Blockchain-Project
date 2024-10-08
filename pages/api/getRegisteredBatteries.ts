import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function getRegisteredBatteries(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const filePath = path.join(process.cwd(), "db", "registeredBatteries.json");

  // Leggi il file JSON
  try {
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const batteries = JSON.parse(fileContents);

    res.status(200).json(batteries);
  } catch (error) {
    res.status(500).json({ error: "Error reading batteries data" });
  }
}
