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
  const [simulationEnded, setSimulationEnded] = useState(false);
  const [acceptedBidIds, setAcceptedBidIds] = useState<number[]>([]);
  const [totalAcceptedAmount, setTotalAcceptedAmount] = useState<number>(0);
  const [requiredEnergy, setRequiredEnergy] = useState<number>(
    marketOptions[0].requiredEnergy
  );
  const [isPositiveReserve, setIsPositiveReserve] = useState<boolean>(
    marketOptions[0].isPositiveReserve
  );

  useEffect(() => {
    const fetchRequiredEnergy = async () => {
      const { data } = await axios.get("/api/getRequiredEnergy");
      if (data.requiredEnergy !== 0) {
        setRequiredEnergy(data.requiredEnergy);
      }
    };
    fetchRequiredEnergy();
    openMarket();
  }, []);

  const handleAcceptBid = (bidId: number, amountInKWh: number) => {
    setAcceptedBidIds((prev) => [...prev, bidId]);
    setTotalAcceptedAmount((prevTotal) => prevTotal + amountInKWh);
  };

  const openMarket = async () => {
    try {
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
    if (simulationEnded) return;
    try {
      const response = await axios.post("/api/closeMarket");
      console.log("Market closed:", response.data);
      setSimulationEnded(true);
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
      <div className="w-full flex justify-center py-8">
        <SimulationClock onEnd={handleSimulationEnd} />
      </div>

      <div className="mt-8 w-full">
        <LayoutSimulation
          handleOpenDialog={handleOpenDialog}
          requiredEnergy={requiredEnergy}
          isPositiveReserve={isPositiveReserve}
        />
      </div>

      <div className="mt-8 w-full flex px-8">
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

        <div className="w-1/2 flex justify-center items-center p-4">
          <Image
            src={tsoImg}
            alt="Aggregator TSO"
            className="max-w-full h-auto"
          />
        </div>
      </div>

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
