import { NextApiRequest, NextApiResponse } from "next";
import { web3, aggregatorContract, getAccounts } from "../../web3";
import { Battery } from "../../src/interfaces/batteryInterface";
import fs from "fs";
import path from "path";

// Percorso del file JSON per salvare le batterie registrate
const filePath = path.join(process.cwd(), "db", "registeredBatteries.json");

export default async function batteryHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req.body);
  const { address, capacity, SoC }: { address: string } & Battery = req.body;
  const accounts = getAccounts();
  const tsoAdminAddress = accounts["TSO Admin"].address;
  const aggregatorAdminAddress = accounts["Aggregator Admin"].address;

  if (req.method === "POST") {
    try {
      // Verifica se l'indirizzo passato è uno degli account sbloccati
      if (!Object.values(accounts).some((acc) => acc.address === address)) {
        return res.status(400).json({ error: "Invalid account address" });
      }

      // Verifica che l'indirizzo non sia quello dell'admin TSO o dell'admin Aggregator
      if (address === tsoAdminAddress || address === aggregatorAdminAddress) {
        return res
          .status(403)
          .json({ error: "Admin accounts cannot register batteries" });
      }

      if (aggregatorContract && aggregatorContract.methods.registerBattery) {
        // 1. Registra la batteria sulla blockchain
        const tx = await aggregatorContract.methods
          .registerBattery(capacity, SoC)
          .send({ from: address, gas: "3000000" })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

        // 2. Se la registrazione va a buon fine, scrivi i dati nel file JSON
        const newBattery = {
          Owner: address,
          Capacity: capacity,
          SoC: SoC,
        };

        let registeredBatteries: any[] = [];
        if (fs.existsSync(filePath)) {
          // Leggi il file JSON esistente
          const fileData = fs.readFileSync(filePath, "utf-8");
          registeredBatteries = JSON.parse(fileData);
        }

        // Aggiungi la nuova batteria
        registeredBatteries.push(newBattery);

        // Scrivi i dati aggiornati nel file JSON
        fs.writeFileSync(
          filePath,
          JSON.stringify(registeredBatteries, null, 2),
          "utf-8"
        );

        // Rispondi con il successo e l'hash della transazione
        res.status(200).json({
          message: "Battery registered successfully",
          txHash: tx.transactionHash,
          battery: newBattery, // Invia i dettagli della batteria come parte della risposta
        });
      } else {
        res.status(500).json({
          error: "aggregatorContract or registerBattery method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
