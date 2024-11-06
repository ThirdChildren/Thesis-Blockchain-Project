import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const resetData = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Define file paths for `placedBids.json` and `paymentDetails.json`
    const placedBidsPath = path.join(process.cwd(), "db", "placedBids.json");
    const acceptedBidsPath = path.join(
      process.cwd(),
      "db",
      "acceptedBids.json"
    );
    const paymentDetailsPath = path.join(
      process.cwd(),
      "db",
      "paymentDetails.json"
    );

    // Reset `placedBids.json` to an empty array
    fs.writeFileSync(placedBidsPath, JSON.stringify([]));

    // Reset `acceptedBids.json` to an empty array
    fs.writeFileSync(acceptedBidsPath, JSON.stringify([]));

    // Reset `paymentDetails.json` to an empty array or object as required
    fs.writeFileSync(paymentDetailsPath, JSON.stringify([]));

    res.status(200).json({ message: "Data reset successfully" });
  } catch (error) {
    console.error("Error resetting data:", error);
    res.status(500).json({ message: "Error resetting data" });
  }
};

export default resetData;
