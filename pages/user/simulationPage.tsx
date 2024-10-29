import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import axios from "axios";
import LayoutSimulation from "../../components/Layouts/LayoutSimulation";
import SimulationClock from "../../components/Clock/SimulationClock";
import AcceptBidsTable from "../../components/Tables/AcceptBidsTable";
import PaymentDetailsTable from "../../components/Tables/PaymentDetailsTable";
import marketOptions from "../../db/marketOptions.json";
import batteriesData from "../../db/batteries.json";
import tsoImg from "../../public/tso.png";
import Receipt from "../../components/Receipt/Receipt";

const SimulationPage = () => {
  const [sessionIndex, setSessionIndex] = useState(0);
  const [firstSession, setFirstSession] = useState(true); // Track first session
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [simulationEnded, setSimulationEnded] = useState(false);
  const [acceptedBidIds, setAcceptedBidIds] = useState<number[]>([]);
  const [totalAcceptedAmount, setTotalAcceptedAmount] = useState<number>(0);
  const [requiredEnergy, setRequiredEnergy] = useState(
    marketOptions[sessionIndex].requiredEnergy
  );
  const [isPositiveReserve, setIsPositiveReserve] = useState(
    marketOptions[sessionIndex].isPositiveReserve
  );
  const [showReceiptDetails, setShowReceiptDetails] = useState(false);
  const [resetTimer, setResetTimer] = useState(false); // To control timer reset
  const [isMarketOpen, setIsMarketOpen] = useState(false); // Track market open state
  const [batteriesPlaced, setBatteriesPlaced] = useState<boolean[]>(
    Array(batteriesData.length).fill(false)
  ); // Initialize the batteriesPlaced state

  useEffect(() => {
    if (firstSession) {
      openMarket();
      setFirstSession(false);
    } else {
      setRequiredEnergy(marketOptions[sessionIndex].requiredEnergy);
      setIsPositiveReserve(marketOptions[sessionIndex].isPositiveReserve);
    }
  }, [firstSession, sessionIndex]);

  const handleAcceptBid = (bidId: number, amountInKWh: number) => {
    setAcceptedBidIds((prev) => [...prev, bidId]);
    setTotalAcceptedAmount((prevTotal) => prevTotal + amountInKWh);
  };

  const openMarket = async () => {
    if (isMarketOpen) return; // Do not open if already open
    try {
      const response = await axios.post("/api/openMarket", {
        requiredEnergy,
        isPositiveReserve,
      });
      console.log("Market opened:", response.data);
      setSimulationEnded(false);
      setIsMarketOpen(true); // Set the market as open
    } catch (error) {
      console.error(
        "Error opening market:",
        axios.isAxiosError(error) && error.response
          ? error.response.data
          : error
      );
    }
  };

  const handleSimulationEnd = async () => {
    if (!isMarketOpen || simulationEnded) return; // Close only if open
    try {
      const response = await axios.post("/api/closeMarket");
      console.log("Market closed:", response.data);
      setSimulationEnded(true);
      setIsMarketOpen(false); // Set the market as closed
    } catch (error) {
      console.error("Error closing market:", error);
    }
  };

  const startNewSession = async () => {
    if (isMarketOpen) {
      // If the market is open, close it first
      await handleSimulationEnd(); // Close the market
    }
    try {
      await axios.post("/api/resetData");

      const newIndex = sessionIndex + 1;
      setSessionIndex(newIndex);
      setAcceptedBidIds([]);
      setTotalAcceptedAmount(0);
      setSimulationEnded(false);
      setBatteriesPlaced(Array(batteriesData.length).fill(false)); // Reset batteries placed for the new session
      setResetTimer(true);

      openMarket(); // Then open the new market
    } catch (error) {
      console.error("Error resetting data for new session:", error);
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

  const handleReceiptClick = () => {
    setShowReceiptDetails(true);
  };

  const handleCloseReceiptDetails = () => {
    setShowReceiptDetails(false);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ backgroundColor: "#2B2930" }}
    >
      <div className="w-full flex justify-center py-8">
        <SimulationClock onEnd={handleSimulationEnd} reset={resetTimer} />
      </div>

      {simulationEnded && (
        <Button
          variant="contained"
          color="secondary"
          onClick={startNewSession}
          className="mt-4"
        >
          Start new session
        </Button>
      )}

      <div className="mt-8 w-full">
        <LayoutSimulation
          handleOpenDialog={handleOpenDialog}
          requiredEnergy={requiredEnergy}
          isPositiveReserve={isPositiveReserve}
          sessionNumber={sessionIndex}
          batteriesPlaced={batteriesPlaced} // Pass batteriesPlaced as a prop
          setBatteriesPlaced={setBatteriesPlaced} // Pass setBatteriesPlaced to manage its state
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

      <div className="fixed bottom-4 right-4">
        <Receipt onClick={handleReceiptClick} />
      </div>

      {showReceiptDetails && (
        <Dialog open={showReceiptDetails} onClose={handleCloseReceiptDetails}>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogContent>
            <PaymentDetailsTable />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SimulationPage;
