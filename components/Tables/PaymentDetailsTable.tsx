// components/Tables/PaymentDetailsTable.tsx

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";

interface PaymentDetail {
  batteryId: number;
  batteryOwner: string;
  batteryOwnerPayment: number;
  aggregatorCommission: number;
  timestamp: string;
}

const PaymentDetailsTable: React.FC = () => {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetail[]>([]);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      const { data } = await axios.get("/api/getPaymentDetails");
      setPaymentDetails(data);
    };

    fetchPaymentDetails();
  }, []);

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Battery ID</TableCell>
            <TableCell>Battery Owner</TableCell>
            <TableCell>Battery Owner Payment ($)</TableCell>
            <TableCell>Aggregator Commission ($)</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paymentDetails.map((detail, index) => (
            <TableRow key={index}>
              <TableCell>{detail.batteryId}</TableCell>
              <TableCell>{detail.batteryOwner}</TableCell>
              <TableCell>{detail.batteryOwnerPayment.toFixed(2)}</TableCell>
              <TableCell>{detail.aggregatorCommission.toFixed(2)}</TableCell>
              <TableCell>
                {new Date(detail.timestamp).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default PaymentDetailsTable;
