import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Battery from "../Battery/Battery";
import BatteryPlaced from "../Battery/BatteryPlaced";

import aggregatorImg from "../../public/aggregator-simulation.png";
import registeredBatteries from "../../db/registeredBatteries.json";
import bidsData from "../../db/bidsData.json";

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
      const batteryIndex = registeredBatteries.findIndex(
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

            // Show notification for the bid
            showBidNotification(
              bidIndex,
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
  sessionNumber: number; // Added sessionNumber as a prop
  batteriesPlaced: boolean[]; // Accept batteriesPlaced as a prop
  setBatteriesPlaced: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const LayoutSimulation: React.FC<LayoutSimulationProps> = ({
  handleOpenDialog,
  requiredEnergy,
  isPositiveReserve,
  sessionNumber,
  batteriesPlaced, // Use batteriesPlaced prop
  setBatteriesPlaced,
}) => {
  const [bidsPlaced, setBidsPlaced] = useState<number | null>(null);
  const [currentBid, setCurrentBid] = useState<{
    batteryOwner: string;
    amountInKWh: number;
    pricePerMWh: number;
  } | null>(null); // Info about the current bid

  // Function to show notifications for bids
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
    // Reset batteries at the start of a new session
    setBatteriesPlaced(Array(registeredBatteries.length).fill(false));

    // Start the bidding process for the current session number
    startBiddingProcess(
      sessionNumber + 1,
      setBidsPlaced,
      setBatteriesPlaced,
      setCurrentBid,
      showBidNotification
    );
  }, [sessionNumber, setBatteriesPlaced]); // Ensure setBatteriesPlaced is included in dependencies

  return (
    <div className="flex-grow flex items-center justify-center w-full">
      <ToastContainer /> {/* Container for displaying notifications */}
      <div className="grid grid-cols-2 gap-4 mr-8">
        {registeredBatteries
          .slice(0, 10)
          .map((battery, idx) =>
            batteriesPlaced[idx] ? (
              <BatteryPlaced key={idx} onClick={() => handleOpenDialog(idx)} />
            ) : (
              <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
            )
          )}
      </div>
      <div className="flex flex-col items-center justify-center mx-8">
        <h2 className="font-bold text-lg mb-4">AGGREGATOR</h2>
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
        {registeredBatteries
          .slice(10, 20)
          .map((battery, idx) =>
            batteriesPlaced[idx + 10] ? (
              <BatteryPlaced
                key={idx + 10}
                onClick={() => handleOpenDialog(idx + 10)}
              />
            ) : (
              <Battery
                key={idx + 10}
                onClick={() => handleOpenDialog(idx + 10)}
              />
            )
          )}
      </div>
    </div>
  );
};

export default LayoutSimulation;
