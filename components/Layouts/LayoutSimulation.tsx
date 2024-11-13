import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Battery from "../Battery/Battery";
import BatteryPlaced from "../Battery/BatteryPlaced";
import aggregatorImg from "../../public/aggregator-simulation.png";
import bidsData from "../../db/bidsData.json";
import initialRegisteredBatteries from "../../db/registeredBatteries.json";
import { Typography } from "@mui/material";

// Function to start the bidding process for the session
const startBiddingProcess = (
  sessionNumber: number,
  setBidsPlaced: React.Dispatch<React.SetStateAction<number | null>>,
  setBatteriesPlaced: React.Dispatch<React.SetStateAction<boolean[]>>,
  setCurrentBid: React.Dispatch<
    React.SetStateAction<{
      batteryOwner: string;
      amountInKWh: number;
      pricePerMWh: number;
    } | null>
  >,
  showBidNotification: (
    bidId: number,
    batteryOwner: string,
    amountInKWh: number,
    pricePerMWh: number
  ) => void
) => {
  const bidsForSession =
    bidsData[`session${sessionNumber}` as keyof typeof bidsData];
  console.log("Bids for session:", bidsForSession);

  if (!bidsForSession) {
    console.error("No bids found for the selected session");
    return;
  }

  let bidIndex = 0;
  const totalBids = bidsForSession.length;
  const bidInterval = (15 * 60 * 1000) / (totalBids * 10); // 15 minutes at 10x speed

  const interval = setInterval(() => {
    if (bidIndex < totalBids) {
      const bid = bidsForSession[bidIndex];
      const batteryIndex = initialRegisteredBatteries.findIndex(
        (battery) => battery.owner === bid.batteryOwner
      );

      if (batteryIndex !== -1) {
        axios
          .post("/api/placeBid", bid)
          .then(() => {
            console.log("Bid placed:", bid);
            setBatteriesPlaced((prev) => {
              const updatedBatteries = [...prev];
              updatedBatteries[batteryIndex] = true; // Mark battery as placed
              return updatedBatteries;
            });

            setBidsPlaced(batteryIndex);
            setCurrentBid({
              batteryOwner: bid.batteryOwner,
              amountInKWh: bid.amountInKWh,
              pricePerMWh: bid.pricePerMWh,
            });

            showBidNotification(
              bidIndex - 1,
              bid.batteryOwner,
              bid.amountInKWh,
              bid.pricePerMWh
            );
          })
          .catch((error) => {
            console.error("Error placing bid:", error); // Error handling for bid placement
          });
      }

      bidIndex++;
    } else {
      clearInterval(interval); // Stop the interval when all bids have been processed
    }
  }, bidInterval);
};

interface LayoutSimulationProps {
  handleOpenDialog: (index: number) => void;
  requiredEnergy: number;
  isPositiveReserve: boolean;
  sessionNumber: number;
  batteriesPlaced: boolean[];
  setBatteriesPlaced: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const LayoutSimulation: React.FC<LayoutSimulationProps> = ({
  handleOpenDialog,
  requiredEnergy,
  isPositiveReserve,
  sessionNumber,
  batteriesPlaced,
  setBatteriesPlaced,
}) => {
  const [bidsPlaced, setBidsPlaced] = useState<number | null>(null);
  const [currentBid, setCurrentBid] = useState<{
    batteryOwner: string;
    amountInKWh: number;
    pricePerMWh: number;
  } | null>(null);

  const [dynamicRegisteredBatteries, setDynamicRegisteredBatteries] = useState(
    initialRegisteredBatteries
  );

  useEffect(() => {
    const fetchBatteries = async () => {
      const response = await import("../../db/registeredBatteries.json");
      setDynamicRegisteredBatteries(response.default);
    };

    fetchBatteries();
  }, [sessionNumber]);

  const showBidNotification = (
    bidId: number,
    batteryOwner: string,
    amountInKWh: number,
    pricePerMWh: number
  ) => {
    toast(
      <div>
        <p>
          <strong>Bid Id:</strong> {bidId}
        </p>
        <p>
          <strong>Battery Owner:</strong> {batteryOwner}
        </p>
        <p>
          <strong>Amount:</strong> {amountInKWh} KWh
        </p>
        <p>
          <strong>Price:</strong> {pricePerMWh} €/MWh
        </p>
      </div>,
      { autoClose: 4000 }
    );
  };

  useEffect(() => {
    startBiddingProcess(
      sessionNumber,
      setBidsPlaced,
      setBatteriesPlaced,
      setCurrentBid,
      showBidNotification
    );
  }, [sessionNumber]);

  return (
    <div className="flex-grow flex items-center justify-center w-full">
      <ToastContainer position="top-left" className="absolute top-4 left-4" />{" "}
      <div className="grid grid-cols-2 gap-4 mr-8">
        {dynamicRegisteredBatteries.slice(0, 10).map((battery, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {batteriesPlaced[idx] ? (
              <BatteryPlaced onClick={() => handleOpenDialog(idx)} />
            ) : (
              <Battery onClick={() => handleOpenDialog(idx)} />
            )}
            <Typography
              variant="caption"
              className="mt-1 text-white font-semibold"
              style={{
                color: "#b3e5fc",
                backgroundColor: "#263238",
                padding: "2px 6px",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              Battery {idx + 1}
            </Typography>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center mx-8">
        <h2 className="font-bold text-lg mb-4" style={{ color: "white" }}>
          AGGREGATOR
        </h2>
        <Image
          src={aggregatorImg}
          alt="Aggregator"
          className="w-64 h-64 object-contain"
        />
        <div className="mt-4 p-4 w-full max-w-xs bg-gray-800 rounded-lg shadow-md text-white text-center">
          <p className="text-lg font-semibold">Market Information</p>
          <div className="mt-2">
            <p>
              <span className="font-bold">Required Energy:</span>{" "}
              {requiredEnergy} kWh
            </p>
            <p>
              <span className="font-bold">Positive Reserve:</span>{" "}
              {isPositiveReserve ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 ml-8">
        {dynamicRegisteredBatteries.slice(10, 20).map((battery, idx) => (
          <div key={idx + 10} className="flex flex-col items-center">
            {batteriesPlaced[idx + 10] ? (
              <BatteryPlaced onClick={() => handleOpenDialog(idx + 10)} />
            ) : (
              <Battery onClick={() => handleOpenDialog(idx + 10)} />
            )}
            <Typography
              variant="caption"
              className="mt-1 text-white font-semibold"
              style={{
                color: "#b3e5fc",
                backgroundColor: "#263238",
                padding: "2px 6px",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              Battery {idx + 11}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayoutSimulation;
