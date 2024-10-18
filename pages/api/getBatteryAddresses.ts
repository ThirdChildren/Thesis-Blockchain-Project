import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const batteryAddresses = Array.from(
    { length: 20 },
    (_, i) => process.env[`ACCOUNT_${i + 1}_ADDRESS`] || ""
  );

  res.status(200).json({ addresses: batteryAddresses });
}
