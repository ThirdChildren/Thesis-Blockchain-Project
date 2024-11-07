import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import axios from "axios";
import LayoutSimulation from "../../components/Layouts/LayoutSimulation";
import SimulationClock from "../../components/Clock/SimulationClock";
import AcceptBidsTable from "../../components/Tables/AcceptBidsTable";
import PaymentDetailsTable from "../../components/Tables/PaymentDetailsTable";
import marketOptions from "../../db/marketOptions.json";
import batteriesData from "../../db/batteries.json";
import tsoImg from "../../public/tso-simulation.png";
import Receipt from "../../components/Receipt/Receipt";

const SimulationPage = () => {
  const [sessionIndex, setSessionIndex] = useState(0);
  const [firstSession, setFirstSession] = useState(true); // Track first session
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [openDialog, setOpenDialog] = useState(false);

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
      openMarket(marketOptions[0].requiredEnergy, true);
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

  const openMarket = async (
    requiredEnergy: number,
    isPositiveReserve: boolean
  ) => {
    if (isMarketOpen) return; // Do not open if already open
    try {
      console.log("Opening market with required energy: ", requiredEnergy);
      console.log("Opening market with positive reserve: ", isPositiveReserve);
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

  async function resetAndStartNewSession() {
    try {
      // Now reset data
      await axios.post("/api/resetData");

      // Delay before starting a new session
      setTimeout(() => {
        startNewSession();
      }, 3000); // Delay of 3 seconds
    } catch (error) {
      console.error("Error during session reset:", error);
    }
  }

  const startNewSession = async () => {
    if (isMarketOpen) {
      // If the market is open, close it first
      await handleSimulationEnd(); // Close the market
    }
    try {
      console.log("Inizio nuova sessione dopo il reset dei dati");
      const newIndex = sessionIndex + 1;
      console.log("Session Index: ", newIndex);
      console.log("iS POSITIVE RESERVE: ", marketOptions[newIndex]);
      setIsPositiveReserve(marketOptions[newIndex].isPositiveReserve);
      setSessionIndex(newIndex);
      setAcceptedBidIds([]);
      setTotalAcceptedAmount(0);
      setSimulationEnded(false);
      setBatteriesPlaced(Array(batteriesData.length).fill(false)); // Reset batteries placed for the new session
      setResetTimer(true);

      setTimeout(() => {
        openMarket(
          marketOptions[newIndex].requiredEnergy,
          marketOptions[newIndex].isPositiveReserve
        );
      }, 2000); // Ritardo di 2 secondi
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
      className="flex flex-col items-center justify-center min-h-screen p-8"
      style={{ backgroundColor: "#2B2930" }}
    >
      {/* Clock posizionato al centro sopra gli altri elementi */}
      <div className="flex flex-col items-center mb-4">
        {" "}
        {/* Aggiunto flex-col */}
        <SimulationClock onEnd={handleSimulationEnd} reset={resetTimer} />
        {simulationEnded && (
          <Button
            variant="contained"
            color="secondary"
            onClick={resetAndStartNewSession}
            className="mt-4" // Margin top per spazio tra timer e pulsante
          >
            Start new session
          </Button>
        )}
      </div>

      {/* Riga con LayoutSimulation, TSO e Tabella */}
      <div className="flex w-full justify-center">
        <div className="w-1/3">
          <LayoutSimulation
            handleOpenDialog={handleOpenDialog}
            requiredEnergy={requiredEnergy}
            isPositiveReserve={isPositiveReserve}
            sessionNumber={sessionIndex}
            batteriesPlaced={batteriesPlaced}
            setBatteriesPlaced={setBatteriesPlaced}
          />
        </div>

        <div className="w-1/3 flex flex-col items-center">
          <h2 className="font-bold text-lg mb-4" style={{ color: "white" }}>
            TSO
          </h2>
          <Image
            src={tsoImg}
            alt="TSO"
            width={200} // Larghezza personalizzata
            height={200} // Altezza personalizzata
            className="mt-4"
          />

          <div className="mt-4">
            <Receipt onClick={handleReceiptClick} />
          </div>
        </div>

        <div className="w-1/3">
          <h2 className="font-bold text-lg mb-4" style={{ color: "white" }}>
            TABELLA DELLE BID
          </h2>
          <Box
            sx={{
              overflowX: "auto",
              overflowY: "scroll",
              maxWidth: "100%",
              mx: "auto",
            }}
          >
            <AcceptBidsTable
              acceptedBidIds={acceptedBidIds}
              totalAcceptedAmount={totalAcceptedAmount}
              requiredEnergy={requiredEnergy}
              onAcceptBid={handleAcceptBid}
            />
          </Box>
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
