import { NextApiRequest, NextApiResponse } from "next";
import batteryHandler from "./registerBattery";
import openMarketHandler from "./openMarket";
import placeBidHandler from "./placeBid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.url === "/api/battery") {
    return batteryHandler(req, res);
  } else if (req.url === "/api/openMarket") {
    return openMarketHandler(req, res);
  } else if (req.url === "/api/placeBid") {
    return placeBidHandler(req, res);
  } else {
    res.status(404).json({ error: "Not Found" });
  }
}
