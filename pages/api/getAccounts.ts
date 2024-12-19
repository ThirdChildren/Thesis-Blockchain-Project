import { NextApiRequest, NextApiResponse } from "next";
import { getAccounts } from "../../web3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const accounts = getAccounts(); // Ottieni la lista degli account
      const accountAddresses = Object.keys(accounts).map((key) => ({
        name: key,
        address: accounts[key].address,
      }));

      res.status(200).json(accountAddresses); // Invia solo gli indirizzi
    } catch (error) {
      res.status(500).json({ error: "Error retrieving accounts" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
