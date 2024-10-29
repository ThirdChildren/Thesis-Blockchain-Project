import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

interface Bid {
  bidId: number;
  batteryOwner: string;
  amountInKWh: number;
  totalPrice: number;
  txHash: string;
}
interface Payment {
  aggregatorCommission: number;
  batteryOwnerPayment: number;
}

interface AcceptBidsTableProps {
  acceptedBidIds: number[];
  totalAcceptedAmount: number;
  requiredEnergy: number;
  onAcceptBid: (bidId: number, amountInKWh: number) => void;
}

const AcceptBidsTable: React.FC<AcceptBidsTableProps> = ({
  acceptedBidIds,
  totalAcceptedAmount,
  requiredEnergy,
  onAcceptBid,
}) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchBids = async () => {
      const { data } = await axios.get("/api/getPlacedBids");
      const sortedBids = data.sort(
        (a: Bid, b: Bid) =>
          a.totalPrice / a.amountInKWh - b.totalPrice / b.amountInKWh
      );
      setBids(sortedBids);
    };

    fetchBids();
  }, []);

  const handleAcceptBid = async (bid: Bid) => {
    try {
      await axios.post("/api/acceptBid", { bidId: bid.bidId });
      onAcceptBid(bid.bidId, bid.amountInKWh);

      const commissionRate = 10;
      const aggregatorCommission = (bid.totalPrice * commissionRate) / 100;
      const batteryOwnerPayment = bid.totalPrice - aggregatorCommission;

      setPayments((prev) => [
        ...prev,
        { aggregatorCommission, batteryOwnerPayment },
      ]);

      // Invia i dettagli di pagamento al server per salvarli nel file JSON
      await axios.post("/api/savePaymentDetails", {
        batteryOwner: bid.batteryOwner,
        batteryOwnerPayment,
        aggregatorCommission,
      });
    } catch (error) {
      console.error(
        "Error accepting bid:",
        (error as any).response ? (error as any).response.data : error
      );
    }
  };

  const isEnergyFulfilled = totalAcceptedAmount >= requiredEnergy;

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bid ID</TableCell>
            <TableCell>Battery Owner</TableCell>
            <TableCell>Amount (kWh)</TableCell>
            <TableCell>Total Price ($)</TableCell>
            <TableCell>Transaction Hash</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((bid, index) => (
            <TableRow key={index}>
              <TableCell>{bid.bidId}</TableCell>
              <TableCell>{bid.batteryOwner}</TableCell>
              <TableCell>{bid.amountInKWh}</TableCell>
              <TableCell>{bid.totalPrice}</TableCell>
              <TableCell className="break-all">{bid.txHash}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAcceptBid(bid)}
                  disabled={acceptedBidIds.includes(bid.bidId)}
                >
                  {acceptedBidIds.includes(bid.bidId) ? "Accepted" : "Accept"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AcceptBidsTable;
