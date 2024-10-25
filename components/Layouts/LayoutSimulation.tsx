import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

import Battery from "../Battery/Battery";
import BatteryPlaced from "../Battery/BatteryPlaced";

import aggregatorImg from "../../public/aggregator-simulation.png";
import registeredBatteries from "../../db/registeredBatteries.json";
import bidsData from "../../db/bidsData.json";

interface LayoutSimulationProps {
  handleOpenDialog: (index: number) => void;
}

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

const LayoutSimulation: React.FC<LayoutSimulationProps> = ({
  handleOpenDialog,
}) => {
  // Stato che tiene traccia delle batterie piazzate
  const [batteriesPlaced, setBatteriesPlaced] = useState<boolean[]>(
    Array(registeredBatteries.length).fill(false)
  );

  // Stato per indicare quale batteria ha appena ricevuto una bid
  const [bidsPlaced, setBidsPlaced] = useState<number | null>(null);

  useEffect(() => {
    // Avvia il processo di piazzamento delle bid
    startBiddingProcess(1, setBidsPlaced, setBatteriesPlaced);
  }, []);

  return (
    <div className="flex-grow flex items-center justify-center w-full">
      {/* Colonne delle batterie a sinistra dell'aggregator */}
      <div className="grid grid-cols-2 gap-4 mr-8">
        {registeredBatteries
          .slice(0, 5)
          .map((battery, idx) =>
            batteriesPlaced[idx] ? (
              <BatteryPlaced key={idx} onClick={() => handleOpenDialog(idx)} />
            ) : (
              <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
            )
          )}
        {registeredBatteries
          .slice(5, 10)
          .map((battery, idx) =>
            batteriesPlaced[idx + 5] ? (
              <BatteryPlaced
                key={idx}
                onClick={() => handleOpenDialog(idx + 5)}
              />
            ) : (
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 5)} />
            )
          )}
      </div>

      {/* Sezione aggregatore centrale */}
      <div className="flex flex-col items-center justify-center mx-8">
        <h2 className="font-bold text-lg mb-4">AGGREGATOR</h2>
        <Image
          src={aggregatorImg}
          alt="Aggregator"
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Colonne delle batterie a destra dell'aggregator */}
      <div className="grid grid-cols-2 gap-4 ml-8">
        {registeredBatteries
          .slice(10, 15)
          .map((battery, idx) =>
            batteriesPlaced[idx + 10] ? (
              <BatteryPlaced
                key={idx}
                onClick={() => handleOpenDialog(idx + 10)}
              />
            ) : (
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 10)} />
            )
          )}
        {registeredBatteries
          .slice(15, 20)
          .map((battery, idx) =>
            batteriesPlaced[idx + 15] ? (
              <BatteryPlaced
                key={idx}
                onClick={() => handleOpenDialog(idx + 15)}
              />
            ) : (
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 15)} />
            )
          )}
      </div>
    </div>
  );
};

export default LayoutSimulation;
