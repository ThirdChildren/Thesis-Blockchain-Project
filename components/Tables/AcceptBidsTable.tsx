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
                  {acceptedBidIds.includes(bid.bidId) ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 90 90"
                        className="w-full h-full"
                      >
                        <circle cx="45" cy="45" r="45" fill="#4bae4f" />
                        <path
                          d="M37.899 62.038c-.529 0-1.037-.21-1.412-.584L22.599 47.606c-.782-.779-.784-2.046-.004-2.828.779-.783 2.046-.786 2.828-.004l12.424 12.389 26.68-28.566c.755-.807 2.021-.85 2.827-.096.808.754.851 2.02.097 2.827L39.36 61.403c-.37.396-.884.625-1.426.635-.012 0-.024 0-.035 0z"
                          fill="#fff"
                        />
                      </svg>
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAcceptBid(bid)}
                    >
                      Accept Bid
                    </Button>
                  )}
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
