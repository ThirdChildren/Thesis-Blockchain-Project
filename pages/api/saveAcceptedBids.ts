import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { reserveType } = req.body; // "PositiveReserve" o "NegativeReserve"

      // Percorsi dei file
      const acceptedBidsPath = path.join(
        process.cwd(),
        "db",
        "acceptedBids.json"
      );
      const savedAcceptedBidsPath = path.join(
        process.cwd(),
        "db",
        "savedAcceptedBids.json"
      );

      // Verifica se acceptedBids.json esiste
      if (!fs.existsSync(acceptedBidsPath)) {
        return res.status(404).json({ error: "acceptedBids.json not found" });
      }

      // Leggi i dati da acceptedBids.json
      const acceptedBidsData = JSON.parse(
        fs.readFileSync(acceptedBidsPath, "utf-8")
      );
      console.log("acceptedBidsData", acceptedBidsData);

      // Assicurati che savedAcceptedBids.json esista
      if (!fs.existsSync(savedAcceptedBidsPath)) {
        fs.writeFileSync(savedAcceptedBidsPath, JSON.stringify({}, null, 2)); // Crea un file vuoto se non esiste
        console.log("File savedAcceptedBids.json creato.");
      }

      // Leggi i dati esistenti di savedAcceptedBids.json
      let savedAcceptedBidsData: any = JSON.parse(
        fs.readFileSync(savedAcceptedBidsPath, "utf-8")
      );
      console.log("savedAcceptedBidsData", savedAcceptedBidsData);

      // Aggiungi i dati di acceptedBids sotto il tipo di riserva specificato
      if (!savedAcceptedBidsData[reserveType]) {
        savedAcceptedBidsData[reserveType] = [];
      }
      savedAcceptedBidsData[reserveType] = [
        ...savedAcceptedBidsData[reserveType],
        ...acceptedBidsData,
      ];
      console.log("savedAcceptedBidsData updated", savedAcceptedBidsData);

      // Scrivi i dati aggiornati nel file savedAcceptedBids.json
      try {
        fs.writeFileSync(
          savedAcceptedBidsPath,
          JSON.stringify(savedAcceptedBidsData, null, 2)
        );
        console.log("Scrittura completata con successo.");
      } catch (error) {
        console.error("Errore durante la scrittura del file:", error);
        return res
          .status(500)
          .json({ error: "Failed to write savedAcceptedBids.json" });
      }

      res
        .status(200)
        .json({ message: "savedAcceptedBids.json updated successfully" });
    } catch (error) {
      console.error("Error updating savedAcceptedBids.json:", error);
      res
        .status(500)
        .json({ error: "Failed to update savedAcceptedBids.json" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
