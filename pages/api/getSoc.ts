import { NextApiRequest, NextApiResponse } from "next";
import { web3, aggregatorContract } from "../../web3";

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
      //console.log("SOC: " + soc!.toString());
      // Restituisce il valore del SoC
      res.status(200).json({ soc: parseInt(soc!.toString()) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
