import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

// Percorso del file JSON per salvare i dettagli di pagamento
const filePath = path.join(process.cwd(), "db", "paymentDetails.json");

export default async function savePaymentDetailsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    batteryOwner,
    batteryOwnerPayment,
    aggregatorCommission,
  }: {
    batteryOwner: string;
    batteryOwnerPayment: number;
    aggregatorCommission: number;
  } = req.body;

  if (req.method === "POST") {
    try {
      // Controlla se il file esiste già e recupera i dettagli esistenti
      let paymentDetails: any[] = [];
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf-8");
        paymentDetails = JSON.parse(fileData);
      }

      // Formatta batteryOwnerPayment e aggregatorCommission per avere solo 2 cifre dopo la virgola
      const formattedBatteryOwnerPayment = parseFloat(
        batteryOwnerPayment.toFixed(2)
      );
      const formattedAggregatorCommission = parseFloat(
        aggregatorCommission.toFixed(2)
      );

      // Crea un nuovo oggetto di dettagli di pagamento
      const newPaymentDetail = {
        batteryOwner,
        batteryOwnerPayment: formattedBatteryOwnerPayment,
        aggregatorCommission: formattedAggregatorCommission,
        timestamp: new Date().toISOString(), // Aggiungi un timestamp se necessario
      };

      // Aggiungi il nuovo dettaglio di pagamento all'array esistente
      paymentDetails.push(newPaymentDetail);

      // Scrivi i dati aggiornati nel file JSON
      fs.writeFileSync(
        filePath,
        JSON.stringify(paymentDetails, null, 2),
        "utf-8"
      );

      res.status(200).json({
        message: "Payment details saved successfully",
      });
    } catch (error) {
      res.status(500).json({ error: (error as any).message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
