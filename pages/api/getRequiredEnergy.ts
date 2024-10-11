import { NextApiRequest, NextApiResponse } from "next";
import { web3, tsoContract, getAccounts } from "../../web3";

export default async function getRequiredEnergy(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const accounts = getAccounts();
  const tsoAdminAddress = accounts["TSO Admin"].address;
  if (req.method === "GET") {
    try {
      const requiredEnergy = await tsoContract.methods.requiredEnergy().call();
      console.log(requiredEnergy!.toString());
      res
        .status(200)
        .json({ requiredEnergy: parseInt(requiredEnergy!.toString()) });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  }
}
