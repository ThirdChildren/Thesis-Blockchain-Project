import { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { Button } from "@mui/material";
import axios from "axios";

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

const AcceptBidPage = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [acceptedBids, setAcceptedBids] = useState<Bid[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [acceptedBidIds, setAcceptedBidIds] = useState<number[]>([]); // Traccia gli ID delle bid accettate

  useEffect(() => {
    // Ottieni le bid dal file JSON e seleziona le migliori offerte
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

  const acceptBid = async (bid: Bid) => {
    try {
      // Chiamata all'API passando il bidId come payload
      const { data } = await axios.post("/api/acceptBid", { bidId: bid.bidId });
      console.log("Bid accepted:", data);

      // Aggiungi la bid accettata alla lista
      setAcceptedBids((prev) => [...prev, bid]);
      setAcceptedBidIds((prev) => [...prev, bid.bidId]); // Aggiungi bidId a quelli accettati

      // Calcola i pagamenti in base alla commissione e ai dati della bid accettata
      const commissionRate = 10; // Esempio di tasso commissione
      const aggregatorCommission = (bid.totalPrice * commissionRate) / 100;
      const batteryOwnerPayment = bid.totalPrice - aggregatorCommission;

      setPayments((prev) => [
        ...prev,
        { aggregatorCommission, batteryOwnerPayment },
      ]);
    } catch (error) {
      console.error("Error accepting bid:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" className="mb-4">
        Accepted Bids
      </Typography>

      <Box className="flex justify-center">
        <TableContainer component={Paper} className="shadow-md">
          <Table>
            <TableHead className="bg-gray-100">
              <TableRow>
                <TableCell>Bid ID</TableCell>
                <TableCell>Battery Owner</TableCell>
                <TableCell>Amount (kWh)</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.bidId}>
                  <TableCell>{bid.bidId}</TableCell>
                  <TableCell>{bid.batteryOwner}</TableCell>
                  <TableCell>{bid.amountInKWh}</TableCell>
                  <TableCell>{bid.totalPrice} ETH</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => acceptBid(bid)}
                      disabled={acceptedBidIds.includes(bid.bidId)} // Disabilita se già accettata
                    >
                      {acceptedBidIds.includes(bid.bidId)
                        ? "Accepted"
                        : "Accept"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {acceptedBids.length > 0 && (
        <>
          <Typography variant="h4" className="mt-8 mb-4">
            Payments
          </Typography>
          <Box className="flex justify-center">
            <TableContainer component={Paper} className="shadow-md">
              <Table>
                <TableHead className="bg-gray-100">
                  <TableRow>
                    <TableCell>Bid ID</TableCell>
                    <TableCell>Battery Owner Payment</TableCell>
                    <TableCell>Aggregator Commission</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment, index) => (
                    <TableRow key={index}>
                      <TableCell>{acceptedBids[index].bidId}</TableCell>
                      <TableCell>{payment.batteryOwnerPayment} ETH</TableCell>
                      <TableCell>{payment.aggregatorCommission} ETH</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Container>
  );
};

export default AcceptBidPage;
