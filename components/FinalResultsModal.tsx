import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import paymentDetails from "../db/paymentDetails.json";
import savedAcceptedBids from "../db/savedAcceptedBids.json";

// Registra i componenti necessari di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinalResultsModalProps {
  open: boolean;
  onClose: () => void;
}

// Funzione per aggregare gli `amount` per batteryId
const aggregateAmounts = (bids: any) => {
  const aggregated: { [key: string]: number } = {};
  if (!bids) return aggregated; // Restituisce un oggetto vuoto se `bids` è undefined
  bids.forEach((bid: any) => {
    const { batteryId, amount } = bid;
    if (!aggregated[batteryId]) {
      aggregated[batteryId] = 0;
    }
    aggregated[batteryId] += amount;
  });
  return aggregated;
};

// Aggregazione dati riserve
const positiveReserve = aggregateAmounts(
  savedAcceptedBids?.PositiveReserve || []
);
const negativeReserve = aggregateAmounts(
  savedAcceptedBids?.NegativeReserve || []
);

// Batterie e energia totale
const allBatteries = Array.from(
  new Set([...Object.keys(positiveReserve), ...Object.keys(negativeReserve)])
).sort((a, b) => Number(a) - Number(b)); // Ordina gli ID delle batterie

const suppliedEnergy = allBatteries.map(
  (id) => -(positiveReserve[id] || 0) // Energia ceduta (riserva positiva)
);
const receivedEnergy = allBatteries.map(
  (id) => negativeReserve[id] || 0 // Energia acquisita (riserva negativa)
);

// Dati per i grafici
const earningsData = {
  labels: paymentDetails.map((detail) => `B${detail.batteryId}`),
  datasets: [
    {
      label: "Battery Owner Earnings ($)",
      data: paymentDetails.map((detail) => detail.batteryOwnerPayment),
      backgroundColor: "rgba(54, 162, 235, 0.6)", // Colore blu
    },
    {
      label: "Aggregator Commission ($)",
      data: paymentDetails.map((detail) => detail.aggregatorCommission),
      backgroundColor: "rgba(255, 99, 132, 0.6)", // Colore rosso
    },
  ],
};

const energyData = {
  labels: allBatteries.map((id) => `B${id}`),
  datasets: [
    {
      label: "Energy Supplied (kWh)",
      data: suppliedEnergy,
      backgroundColor: "rgba(255, 99, 132, 0.6)", // Colore rosso (negativo)
    },
    {
      label: "Energy Received (kWh)",
      data: receivedEnergy,
      backgroundColor: "rgba(54, 162, 235, 0.6)", // Colore blu (positivo)
    },
  ],
};

// Opzioni dei grafici
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 10,
      },
    },
  },
};

const FinalResultsModal: React.FC<FinalResultsModalProps> = ({
  open,
  onClose,
}) => {
  if (!savedAcceptedBids || !paymentDetails) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>Final Simulation Results</DialogTitle>
        <DialogContent>
          <p>Loading data...</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        Final Simulation Results
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Bar
              data={earningsData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Earnings Distribution by Battery and Aggregator",
                  },
                },
              }}
            />
          </div>
          <div>
            <Bar
              data={energyData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: "Batteries Supplied & Received Energy",
                  },
                },
                scales: { y: { beginAtZero: false, ticks: { stepSize: 50 } } },
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinalResultsModal;
