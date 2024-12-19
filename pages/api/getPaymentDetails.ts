import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function getPaymentDetails(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const filePath = path.join(process.cwd(), "db", "paymentDetails.json");

  // Leggi il file JSON
  try {
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const payments = JSON.parse(fileContents);

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: "Error reading payments data" });
  }
}
