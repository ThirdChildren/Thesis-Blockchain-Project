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

interface Battery {
  owner: string;
  capacity: number;
  soc: number;
  txHash: string;
}

const RegisteredBatteryTable = () => {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [orderBy, setOrderBy] = useState<"capacity">("capacity");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");

  // Effettua la chiamata API per ottenere le batterie registrate
  useEffect(() => {
    const fetchBatteries = async () => {
      try {
        const response = await axios.get("/api/getRegisteredBatteries");
        setBatteries(response.data);
      } catch (error) {
        console.error("Error fetching batteries data", error);
      }
    };
    fetchBatteries();
  }, []);

  // Funzione per gestire l'ordinamento
  const handleSort = () => {
    const isAsc = orderDirection === "asc";
    setOrderDirection(isAsc ? "desc" : "asc");
    setBatteries((prevBatteries) =>
      prevBatteries
        .slice()
        .sort((a, b) =>
          isAsc ? b.capacity - a.capacity : a.capacity - b.capacity
        )
    );
  };

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Address</TableCell>
            <TableCell>
              <TableSortLabel
                active={true}
                direction={orderDirection}
                onClick={handleSort}
              >
                Capacity (KWh)
              </TableSortLabel>
            </TableCell>
            <TableCell>SoC (%)</TableCell>
            <TableCell>Transaction Hash</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {batteries.map((battery, index) => (
            <TableRow key={index}>
              <TableCell>{battery.owner}</TableCell>
              <TableCell>{battery.capacity}</TableCell>
              <TableCell>{battery.soc}</TableCell>
              <TableCell className="break-all">{battery.txHash}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default RegisteredBatteryTable;
