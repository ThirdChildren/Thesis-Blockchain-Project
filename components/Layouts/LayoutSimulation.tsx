import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Battery from "../Battery/Battery";
import BatterySemiFull from "../Battery/BatterySemiFull";
import BatteryHalfFull from "../Battery/BatteryHalfFull";
import BatterySemiEmpty from "../Battery/BatterySemiEmpty";
import BatteryEmpty from "../Battery/BatteryEmpty";
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
      batteryId: number;
      batteryOwner: string;
      amountInKWh: number;
      pricePerMWh: number;
    } | null>
  >,
  showBidNotification: (
    bidId: number,
    batteryId: number,
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
        const batteryId = initialRegisteredBatteries[batteryIndex].batteryId; // Get batteryId from registered batteries

        const bidWithBatteryId = {
          ...bid,
          batteryId, // Aggiungi batteryId alla bid
        };

        axios
          .post("/api/placeBid", bidWithBatteryId) // Passa la bid con batteryId
          .then(() => {
            console.log("Bid placed:", bidWithBatteryId);
            setBatteriesPlaced((prev) => {
              const updatedBatteries = [...prev];
              updatedBatteries[batteryIndex] = true; // Mark battery as placed
              return updatedBatteries;
            });

            setBidsPlaced(batteryIndex);
            setCurrentBid({
              batteryId,
              batteryOwner: bid.batteryOwner,
              amountInKWh: bid.amountInKWh,
              pricePerMWh: bid.pricePerMWh,
            });

            showBidNotification(
              bidIndex,
              batteryId,
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
  dynamicRegisteredBatteries: any[];
}

const LayoutSimulation: React.FC<LayoutSimulationProps> = ({
  handleOpenDialog,
  requiredEnergy,
  isPositiveReserve,
  sessionNumber,
  batteriesPlaced,
  setBatteriesPlaced,
  dynamicRegisteredBatteries,
}) => {
  const [bidsPlaced, setBidsPlaced] = useState<number | null>(null);
  const [currentBid, setCurrentBid] = useState<{
    batteryId: number;
    batteryOwner: string;
    amountInKWh: number;
    pricePerMWh: number;
  } | null>(null);

  const getBatteryComponent = (SoC: number) => {
    if (SoC >= 80) {
      return Battery;
    } else if (SoC >= 60) {
      return BatterySemiFull;
    } else if (SoC >= 30) {
      return BatteryHalfFull;
    } else if (SoC > 0) {
      return BatterySemiEmpty;
    } else {
      return BatteryEmpty;
    }
  };

  const showBidNotification = (
    bidId: number,
    batteryId: number,
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
          <strong>Battery Id:</strong> {batteryId}
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
        {initialRegisteredBatteries.slice(0, 10).map((battery, idx) => {
          const newSoc =
            battery.soc != dynamicRegisteredBatteries[idx].soc
              ? dynamicRegisteredBatteries[idx].soc
              : battery.soc;
          const BatteryComponent = getBatteryComponent(newSoc);
          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`rounded-lg ${
                  batteriesPlaced[idx]
                    ? "outline outline-4 outline-blue-500"
                    : ""
                }`}
              >
                <BatteryComponent onClick={() => handleOpenDialog(idx)} />
              </div>
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold bg-gray-800 px-2 py-1 rounded text-center max-w-[100px] line-clamp-2"
              >
                B{idx + 1} ({newSoc}%)
              </Typography>
            </div>
          );
        })}
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
              <span className="font-bold">Session Number:</span>{" "}
              {sessionNumber + 1}
            </p>
            <p>
              <span className="font-bold">Required Energy:</span>{" "}
              {requiredEnergy} kWh
            </p>
            <p>
              <span className="font-bold">Type of reserve:</span>{" "}
              {isPositiveReserve ? "V2G" : "G2V"}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 ml-8">
        {initialRegisteredBatteries.slice(10, 20).map((battery, idx) => {
          const newSoc =
            battery.soc != dynamicRegisteredBatteries[idx + 10].soc
              ? dynamicRegisteredBatteries[idx + 10].soc
              : battery.soc;
          const BatteryComponent = getBatteryComponent(newSoc);
          return (
            <div key={idx + 10} className="flex flex-col items-center">
              <div
                className={`rounded-lg ${
                  batteriesPlaced[idx + 10]
                    ? "outline outline-4 outline-blue-500"
                    : ""
                }`}
              >
                <BatteryComponent onClick={() => handleOpenDialog(idx + 10)} />
              </div>
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold bg-gray-800 px-2 py-1 rounded text-center max-w-[100px] line-clamp-2"
              >
                B{idx + 11} ({newSoc}%)
              </Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayoutSimulation;
