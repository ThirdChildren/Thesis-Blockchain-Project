import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
} from "@mui/material";

interface Bid {
  bidId: number;
  batteryOwner: string;
  amountInKWh: number;
  totalPrice: number;
  txHash: string;
}

const PlacedBidsTable = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [orderBy, setOrderBy] = useState<"capacity">("capacity");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

  // Effettua la chiamata API per ottenere le bids piazzate
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axios.get("/api/getPlacedBids");
        setBids(response.data);
      } catch (error) {
        console.error("Error fetching bids data", error);
      }
    };
    fetchBids();
  }, []);

  // Funzione per gestire l'ordinamento
  /* const handleSort = () => {
    const isAsc = orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setBids((prevBids) =>
      prevBids
        .slice()
        .sort((a, b) =>
          isAsc ? b.capacity - a.capacity : a.capacity - b.capacity
        )
    );
  }; */

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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default PlacedBidsTable;
