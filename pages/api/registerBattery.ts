import { NextApiRequest, NextApiResponse } from "next";
import { web3, aggregatorContract, getAccounts } from "../../web3";
import { Battery } from "../../src/interfaces/batteryInterface";

export default async function batteryHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, capacity, SoC }: { address: string } & Battery = req.body;
  const accounts = getAccounts();
  const tsoAdminAddress = accounts["TSO Admin"].address;
  const aggregatorAdminAddress = accounts["Aggregator Admin"].address; // Aggiungi questo se hai un account admin per l'aggregator

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
        // 1. Registra la batteria
        const tx = await aggregatorContract.methods
          .registerBattery(capacity, SoC)
          .send({ from: address, gas: "3000000" })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

        res.status(200).json({
          message: "Battery registered successfully",
          txHash: tx.transactionHash,
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
