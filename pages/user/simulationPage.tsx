import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import axios from "axios";
import LayoutSimulation from "../../components/Layouts/LayoutSimulation";
import SimulationClock from "../../components/Clock/SimulationClock";
import AcceptBidsTable from "../../components/Tables/AcceptBidsTable";
import marketOptions from "../../db/marketOptions.json";
import batteriesData from "../../db/batteries.json";
import tsoImg from "../../public/tso.png";

const SimulationPage = () => {
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [simulationEnded, setSimulationEnded] = useState(false); // Nuovo stato per la fine della simulazione

  const [acceptedBidIds, setAcceptedBidIds] = useState<number[]>([]);
  const [totalAcceptedAmount, setTotalAcceptedAmount] = useState<number>(0);
  const [requiredEnergy, setRequiredEnergy] = useState<number>(0);

  useEffect(() => {
    const fetchRequiredEnergy = async () => {
      const { data } = await axios.get("/api/getRequiredEnergy");
      setRequiredEnergy(data.requiredEnergy);
    };
    fetchRequiredEnergy();
    openMarket();
  }, []); // Chiamata iniziale unica per openMarket

  const handleAcceptBid = (bidId: number, amountInKWh: number) => {
    setAcceptedBidIds((prev) => [...prev, bidId]);
    setTotalAcceptedAmount((prevTotal) => prevTotal + amountInKWh);
  };

  const openMarket = async () => {
    try {
      const { requiredEnergy, isPositiveReserve } = marketOptions[0];
      const response = await axios.post("/api/openMarket", {
        requiredEnergy,
        isPositiveReserve,
      });
      console.log("Market opened:", response.data);
    } catch (error) {
      console.error("Error opening market:", error);
    }
  };

  const handleSimulationEnd = async () => {
    if (simulationEnded) return; // Se la simulazione è già terminata, non richiama closeMarket

    try {
      const response = await axios.post("/api/closeMarket");
      console.log("Market closed:", response.data);
      setSimulationEnded(true); // Imposta che la simulazione è terminata
    } catch (error) {
      console.error("Error closing market:", error);
    }
  };

  const handleOpenDialog = (index: number) => {
    setSelectedBatteryIndex(index);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatteryIndex(null);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "#2B2930" }}
    >
      {/* Timer della simulazione */}
      <div className="w-full flex justify-center py-8">
        <SimulationClock onEnd={handleSimulationEnd} />
      </div>

      {/* Layout delle batterie */}
      <div className="mt-8 w-full">
        <LayoutSimulation handleOpenDialog={handleOpenDialog} />
      </div>

      {/* Sezione con pulsante e immagine del TSO */}
      <div className="mt-8 w-full flex px-8">
        {/* Contenitore pulsante e tabella */}
        <div className="w-1/2 flex flex-col items-center p-4">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? "Close Table" : "Show Bids Table"}
          </Button>

          {showTable && (
            <div className="mt-4 ml-12">
              <AcceptBidsTable
                acceptedBidIds={acceptedBidIds}
                totalAcceptedAmount={totalAcceptedAmount}
                requiredEnergy={requiredEnergy}
                onAcceptBid={handleAcceptBid}
              />
            </div>
          )}
        </div>

        {/* Immagine del TSO */}
        <div className="w-1/2 flex justify-center items-center p-4">
          <Image
            src={tsoImg}
            alt="Aggregator TSO"
            className="max-w-full h-auto"
          />
        </div>
      </div>

      {/* Dialog per la visualizzazione delle informazioni della batteria */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Battery Information</DialogTitle>
        <DialogContent>
          {selectedBatteryIndex !== null && (
            <div>
              <p>
                <strong>SoC (%):</strong>{" "}
                {batteriesData[selectedBatteryIndex].SoC}
              </p>
              <p>
                <strong>Capacity (KWh):</strong>{" "}
                {batteriesData[selectedBatteryIndex].capacity}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimulationPage;
