import { NextApiRequest, NextApiResponse } from "next";
import { web3, getAccounts, tsoContract } from "../../web3";

export default async function closeMarketHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accounts = getAccounts();
  const tsoAdminAccount = accounts["TSO Admin"].address;

  if (req.method === "POST") {
    try {
      const tx = await tsoContract.methods
        .closeMarket()
        .send({ from: tsoAdminAccount, gas: "3000000" })
        .on("receipt", (tx) => {
          console.log("Transaction successful:", tx);
        });

      res.json({
        message: "Market closed successfully",
        txHash: tx.transactionHash,
      });
    } catch (error) {
      console.error("Error closing market:", error);
      res.status(500).json({ error: (error as any).message });
    }
  }
}
