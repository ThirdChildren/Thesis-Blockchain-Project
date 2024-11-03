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
  Tooltip,
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

  const fetchBids = async () => {
    try {
      const { data } = await axios.get("/api/getPlacedBids");
      const sortedBids = data.sort(
        (a: Bid, b: Bid) =>
          a.totalPrice / a.amountInKWh - b.totalPrice / b.amountInKWh
      );
      setBids(sortedBids);
    } catch (error) {
      console.error("Errore durante il recupero delle bid:", error);
    }
  };

  useEffect(() => {
    fetchBids(); // Prima chiamata per ottenere i dati iniziali
    const intervalId = setInterval(fetchBids, 5000); // Polling ogni 5 secondi
    return () => clearInterval(intervalId); // Pulisce l'intervallo alla disconnessione
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

      await axios.post("/api/savePaymentDetails", {
        batteryOwner: bid.batteryOwner,
        batteryOwnerPayment,
        aggregatorCommission,
      });
    } catch (error) {
      console.error("Error accepting bid:", error);
    }
  };

  const isEnergyFulfilled = totalAcceptedAmount >= requiredEnergy;

  return (
    <Paper style={{ backgroundColor: "transparent" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ color: "white" }}>Bid ID</TableCell>
            <TableCell style={{ color: "white" }}>Battery Owner</TableCell>
            <TableCell style={{ color: "white" }}>Amount (kWh)</TableCell>
            <TableCell style={{ color: "white" }}>Total Price ($)</TableCell>
            <TableCell style={{ color: "white" }}>Tx Hash</TableCell>
            <TableCell style={{ color: "white" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bids.map((bid, index) => (
            <TableRow key={index}>
              <TableCell style={{ color: "white" }}>{bid.bidId}</TableCell>
              <TableCell style={{ color: "white" }}>
                <Tooltip title={bid.batteryOwner} arrow>
                  <span>{bid.batteryOwner.slice(0, 5)}...</span>
                </Tooltip>
              </TableCell>
              <TableCell style={{ color: "white" }}>
                {bid.amountInKWh}
              </TableCell>
              <TableCell style={{ color: "white" }}>{bid.totalPrice}</TableCell>
              <TableCell style={{ color: "white" }}>
                <Tooltip title={bid.txHash} arrow>
                  <span>{bid.txHash.slice(0, 5)}...</span>
                </Tooltip>
              </TableCell>
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
