import { NextApiRequest, NextApiResponse } from "next";
import { web3, aggregatorContract, tsoContract, getAccounts } from "../../web3";
import { Battery } from "../../src/interfaces/batteryInterface";

export default async function batteryHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { account1, tsoAdminAccount } = getAccounts();
  const { capacity, SoC }: Battery = req.body;

  if (req.method === "POST") {
    try {
      if (
        aggregatorContract &&
        aggregatorContract.methods.registerBattery &&
        tsoContract &&
        tsoContract.methods.setAggregator
      ) {
        // 1. Registra la batteria
        const tx = await aggregatorContract.methods
          .registerBattery(account1.address, capacity, SoC)
          .send({ from: account1.address, gas: "3000000" })
          .on("receipt", async (tx) => {
            console.log(tx);
          });

        // 2. Associa l'aggregatore
        await tsoContract.methods
          .setAggregator(account1.address, aggregatorContract.options.address)
          .send({ from: tsoAdminAccount.address });

        res.status(200).json({
          message: "Battery registered successfully and aggregator set",
          txHash: tx.transactionHash,
        });
      } else {
        res.status(500).json({
          error:
            "aggregatorContract or registerBattery method or tsoContract or setAggregator method is undefined",
        });
      }
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  }
}
