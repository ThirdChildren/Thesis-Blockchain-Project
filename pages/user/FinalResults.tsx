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
import paymentDetails from "../../db/paymentDetails.json";

// Registra i componenti necessari di Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Trasforma i dati per il grafico
const labels = paymentDetails.map((detail) => `B${detail.batteryId}`);
const ownerPayments = paymentDetails.map(
  (detail) => detail.batteryOwnerPayment
);
const aggregatorCommissions = paymentDetails.map(
  (detail) => detail.aggregatorCommission
);

const data = {
  labels,
  datasets: [
    {
      label: "Battery Owner Earnings (€)",
      data: ownerPayments,
      backgroundColor: "rgba(54, 162, 235, 0.6)", // Colore blu
    },
    {
      label: "Aggregator Commission (€)",
      data: aggregatorCommissions,
      backgroundColor: "rgba(255, 99, 132, 0.6)", // Colore rosso
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Earnings Distribution by Battery and Aggregator",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 10, // Incrementi di 10
      },
    },
  },
};

const FinalResultPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Final Results</h1>
      <Bar data={data} options={options} />
    </div>
  );
};

export default FinalResultPage;
