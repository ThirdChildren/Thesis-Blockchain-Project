import { NextApiRequest, NextApiResponse } from "next";
import { web3, aggregatorContract } from "../../web3";
import fs from "fs";
import path from "path";

export default async function getSoc(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { batteryOwner } = req.query;

      if (!batteryOwner) {
        return res
          .status(400)
          .json({ error: "Battery owner address is required" });
      }

      // Chiamata alla funzione getBatterySoC
      const soc = await aggregatorContract.methods
        .getBatterySoC(batteryOwner)
        .call();
      const socValue = parseInt(soc!.toString());
      console.log("SoC value for battery owner", batteryOwner, ":", socValue);

      // Aggiornamento del file registeredBatteries.json
      const filePath = path.join(
        process.cwd(),
        "db",
        "registeredBatteries.json"
      );
      const registeredBatteries = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );

      // Trovare e aggiornare il valore di soc
      const batteryIndex = registeredBatteries.findIndex(
        (battery: any) => battery.owner === batteryOwner
      );

      if (batteryIndex !== -1) {
        registeredBatteries[batteryIndex].soc = socValue;

        // Scrivere il file aggiornato
        fs.writeFileSync(
          filePath,
          JSON.stringify(registeredBatteries, null, 2)
        );
      }

      // Restituisce il valore del SoC
      res.status(200).json({ soc: socValue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
