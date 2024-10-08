import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const marketOptionsPath = path.join(process.cwd(), "db/marketOptions.json");

export default async function updateMarketOptionsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { marketOption } = req.body; // L'elemento da rimuovere e reinserire

    try {
      // Leggi il file JSON
      const data = fs.readFileSync(marketOptionsPath, "utf-8");
      const marketOptions = JSON.parse(data);

      // Rimuovi l'elemento usato
      const updatedOptions = marketOptions.filter(
        (option: { requiredEnergy: number }) =>
          option.requiredEnergy !== marketOption.requiredEnergy
      );

      // Aggiungi l'elemento alla fine
      updatedOptions.push(marketOption);

      // Scrivi di nuovo il file JSON
      fs.writeFileSync(
        marketOptionsPath,
        JSON.stringify(updatedOptions, null, 2)
      );

      res.status(200).json({ message: "Market options updated successfully." });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
