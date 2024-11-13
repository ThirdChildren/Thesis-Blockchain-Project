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
  TableContainer,
  Snackbar,
  Alert,
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
  const [showSnackbar, setShowSnackbar] = useState(false);

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
    fetchBids();
    const intervalId = setInterval(fetchBids, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Mostra lo Snackbar solo una volta quando l'energia richiesta è raggiunta
  useEffect(() => {
    if (totalAcceptedAmount >= requiredEnergy && !showSnackbar) {
      setShowSnackbar(true);
    }
  }, [totalAcceptedAmount, requiredEnergy]);

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

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

      await axios.get("api/getSoc", {
        params: { batteryOwner: bid.batteryOwner },
      });
    } catch (error) {
      console.error("Error accepting bid:", error);
    }
  };

  return (
    <Paper style={{ backgroundColor: "transparent" }}>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          Energy selected has reached the required amount of {requiredEnergy}{" "}
          kWh!
        </Alert>
      </Snackbar>

      <TableContainer sx={{ maxHeight: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white", backgroundColor: "#333" }}>
                Bid ID
              </TableCell>
              <TableCell sx={{ color: "white", backgroundColor: "#333" }}>
                Battery Owner
              </TableCell>
              <TableCell sx={{ color: "white", backgroundColor: "#333" }}>
                Amount (kWh)
              </TableCell>
              <TableCell sx={{ color: "white", backgroundColor: "#333" }}>
                Total Price ($)
              </TableCell>
              <TableCell sx={{ color: "white", backgroundColor: "#333" }}>
                Tx Hash
              </TableCell>
              <TableCell sx={{ color: "white", backgroundColor: "#333" }}>
                Action
              </TableCell>
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
                <TableCell style={{ color: "white" }}>
                  {bid.totalPrice}
                </TableCell>
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
      </TableContainer>
    </Paper>
  );
};

export default AcceptBidsTable;
