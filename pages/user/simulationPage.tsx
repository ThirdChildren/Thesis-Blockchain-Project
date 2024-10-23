import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import axios from "axios";
import LayoutSimulation from "../../components/Layouts/LayoutSimulation";
import SimulationClock from "../../components/Clock/SimulationClock";
import marketOptions from "../../db/marketOptions.json";
import batteriesData from "../../db/batteries.json";

const SimulationPage = () => {
  const [marketOpened, setMarketOpened] = useState<boolean>(false);
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Funzione per chiamare l'API e aprire il mercato
  const openMarket = async () => {
    try {
      const { requiredEnergy, isPositiveReserve } = marketOptions[0]; // Prima sessione di mercato
      const response = await axios.post("/api/openMarket", {
        requiredEnergy,
        isPositiveReserve,
      });
      console.log("Market opened:", response.data);
      setMarketOpened(true); // Il mercato è stato aperto
    } catch (error) {
      console.error("Error opening market:", error);
    }
  };

  // Callback che viene chiamata quando il timer termina
  const handleSimulationEnd = async () => {
    console.log("Simulation has ended.");
    try {
      const response = await axios.post("/api/closeMarket");
      console.log("Market closed:", response.data);
    } catch (error) {
      console.error("Error closing market:", error);
    }
  };

  useEffect(() => {
    // Quando il componente viene caricato, apriamo il mercato
    openMarket();
  }, []);

  // Funzione per aprire il dialog
  const handleOpenDialog = (index: number) => {
    setSelectedBatteryIndex(index);
    setOpenDialog(true);
  };

  // Funzione per chiudere il dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatteryIndex(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Timer della simulazione */}
      <div className="w-full flex justify-center py-8">
        <SimulationClock onEnd={handleSimulationEnd} />
      </div>

      {/* Layout delle batterie */}
      <div className="mt-8 w-full">
        <LayoutSimulation handleOpenDialog={handleOpenDialog} />
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
