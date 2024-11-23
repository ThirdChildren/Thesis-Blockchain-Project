import React from "react";
import { Bar } from "react-chartjs-2";
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

// Funzione per aggregare gli `amount` per batteryId
const aggregateAmounts = (bids: any) => {
  const aggregated: { [key: string]: number } = {};
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
const positiveReserve = aggregateAmounts(savedAcceptedBids.PositiveReserve);
const negativeReserve = aggregateAmounts(savedAcceptedBids.NegativeReserve);

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

const FinalResultPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        Final Simulation Results
      </h1>
      <div className="flex justify-between">
        <div className="w-1/2 pr-4">
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
        <div className="w-1/2 pl-4">
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
    </div>
  );
};

export default FinalResultPage;
