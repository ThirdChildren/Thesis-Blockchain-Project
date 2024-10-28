import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

import Battery from "../Battery/Battery";
import BatteryPlaced from "../Battery/BatteryPlaced";

import aggregatorImg from "../../public/aggregator-simulation.png";
import registeredBatteries from "../../db/registeredBatteries.json";
import bidsData from "../../db/bidsData.json";

// Avvio della simulazione e piazzamento delle bid
const startBiddingProcess = (
  sessionNumber: number,
  setBidsPlaced: React.Dispatch<React.SetStateAction<number | null>>,
  setBatteriesPlaced: React.Dispatch<React.SetStateAction<boolean[]>>
) => {
  const bidsForSession =
    bidsData[`session${sessionNumber}` as keyof typeof bidsData];
  if (!bidsForSession) {
    console.error("No bids found for the selected session");
    return;
  }

  let bidIndex = 0;
  const totalBids = bidsForSession.length;
  const bidInterval = (15 * 60 * 1000) / (totalBids * 10); // 15 minuti a velocità 10x

  const interval = setInterval(() => {
    if (bidIndex < totalBids) {
      const bid = bidsForSession[bidIndex];

      // Trova la batteria corrispondente al proprietario della bid
      const batteryIndex = registeredBatteries.findIndex(
        (battery) => battery.owner === bid.batteryOwner
      );

      if (batteryIndex !== -1) {
        // Simula la chiamata API
        axios.post("/api/placeBid", bid).then(() => {
          console.log("Bid placed:", bid);
          setBatteriesPlaced((prev) => {
            const updatedBatteries = [...prev];
            updatedBatteries[batteryIndex] = true; // Segna la batteria come "piazzata"
            return updatedBatteries;
          });

          setBidsPlaced(batteryIndex); // Attiva la batteria su cui è stata piazzata la bid
        });
      }

      bidIndex++;
    } else {
      clearInterval(interval);
    }
  }, bidInterval);
};

interface LayoutSimulationProps {
  handleOpenDialog: (index: number) => void;
  requiredEnergy: number;
  isPositiveReserve: boolean;
}

const LayoutSimulation: React.FC<LayoutSimulationProps> = ({
  handleOpenDialog,
  requiredEnergy,
  isPositiveReserve,
}) => {
  const [batteriesPlaced, setBatteriesPlaced] = useState<boolean[]>(
    Array(20).fill(false)
  );
  const [bidsPlaced, setBidsPlaced] = useState<number | null>(null);

  useEffect(() => {
    startBiddingProcess(1, setBidsPlaced, setBatteriesPlaced);
  }, []);

  return (
    <div className="flex-grow flex items-center justify-center w-full">
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
