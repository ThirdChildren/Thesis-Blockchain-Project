import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Dialog, DialogTitle, DialogContent, Box } from "@mui/material";
import axios from "axios";
import LayoutSimulation from "../../components/Layouts/LayoutSimulation";
import SimulationClock from "../../components/Clock/SimulationClock";
import AcceptBidsTable from "../../components/Tables/AcceptBidsTable";
import PaymentDetailsTable from "../../components/Tables/PaymentDetailsTable";
import marketOptions from "../../db/marketOptions.json";
import placedBids from "../../db/placedBids.json";
import registeredBatteries from "../../db/registeredBatteries.json";
import tsoImg from "../../public/tso-simulation.png";
import smartGridImg from "../../public/smartgrid.png";
import Receipt from "../../components/Receipt/Receipt";

const SimulationPage = () => {
  const [sessionIndex, setSessionIndex] = useState(0);
  const [firstSession, setFirstSession] = useState(true); // Track first session
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [selectedBatteryData, setSelectedBatteryData] = useState<{
    owner: string;
    soc: number;
    capacity: number;
  } | null>(null);
  const [dynamicRegisteredBatteries, setDynamicRegisteredBatteries] =
    useState(registeredBatteries);
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
    Array(registeredBatteries.length).fill(false)
  ); // Initialize the batteriesPlaced state
  const [newSessionState, setNewSessionState] = useState(false);

  useEffect(() => {
    if (firstSession) {
      openMarket(marketOptions[0].requiredEnergy, true);
      setFirstSession(false);
    } else {
      setRequiredEnergy(marketOptions[sessionIndex].requiredEnergy);
      setIsPositiveReserve(marketOptions[sessionIndex].isPositiveReserve);
    }
  }, [firstSession, sessionIndex]);

  useEffect(() => {
    if (selectedBatteryIndex !== null) {
      const batteryData = dynamicRegisteredBatteries[selectedBatteryIndex];
      if (batteryData) {
        setSelectedBatteryData(batteryData);
      }
    }
  }, [selectedBatteryIndex, dynamicRegisteredBatteries]);

  const handleAcceptBid = async (bidId: number, amountInKWh: number) => {
    setAcceptedBidIds((prev) => [...prev, bidId]);
    setTotalAcceptedAmount((prevTotal) => prevTotal + amountInKWh);

    // Ottieni l'indice della batteria che ha vinto la bid
    const winningBid = placedBids.find((bid) => bid.bidId === bidId);

    if (winningBid) {
      const batteryIndex = registeredBatteries.findIndex(
        (battery) => battery.owner === winningBid.batteryOwner
      );

      if (batteryIndex !== -1) {
        // Chiama la funzione getSoc per aggiornare il SoC della batteria
        try {
          const response = await axios.get("/api/getSoc", {
            params: { batteryOwner: winningBid.batteryOwner },
          });
          const newSoC = response.data.soc;

          // Aggiorna il SoC della batteria
          setDynamicRegisteredBatteries((prev) => {
            const updatedBatteries = [...prev];
            updatedBatteries[batteryIndex].soc = newSoC;
            return updatedBatteries;
          });
        } catch (error) {
          console.error("Errore durante l'aggiornamento del SoC:", error);
        }
      }
    }
  };

  const openMarket = async (
    requiredEnergy: number,
    isPositiveReserve: boolean
  ) => {
    if (isMarketOpen) return; // Do not open if already open
    try {
      /*  console.log("Opening market with required energy: ", requiredEnergy);
      console.log("Opening market with positive reserve: ", isPositiveReserve); */
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
      setIsPositiveReserve(marketOptions[newIndex].isPositiveReserve);
      setNewSessionState(false);
      setSessionIndex(newIndex);
      setAcceptedBidIds([]);
      setTotalAcceptedAmount(0);
      setSimulationEnded(false);
      setBatteriesPlaced(Array(registeredBatteries.length).fill(false)); // Reset batteries placed for the new session
      setResetTimer(true);
      setIsMarketOpen(false); // Set the market as closed

      setTimeout(() => {
        setResetTimer(false);
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
        {simulationEnded &&
          newSessionState &&
          sessionIndex + 1 < marketOptions.length && (
            <Button
              variant="contained"
              color="secondary"
              onClick={resetAndStartNewSession}
              className="mt-4" // Margin top per spazio tra timer e pulsante
            >
              Start new session
            </Button>
          )}
        {simulationEnded &&
          newSessionState &&
          sessionIndex + 1 == marketOptions.length && (
            <Link href="/FinalResultsPage" passHref>
              <Button variant="contained" color="primary" className="mt-4">
                Go to final results
              </Button>
            </Link>
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
            dynamicRegisteredBatteries={dynamicRegisteredBatteries}
          />
        </div>

        <div className="w-1/3 flex flex-col items-center">
          <h2 className="font-bold text-lg mb-4" style={{ color: "white" }}>
            Power Grid
          </h2>
          <Image src={smartGridImg} alt="TSO" className="w-96 h-64 mt-4 " />

          <div>
            <Receipt onClick={handleReceiptClick} />
          </div>
        </div>

        <div className="w-1/3">
          <h2 className="font-bold text-lg mb-4" style={{ color: "white" }}>
            BIDS REGISTRY
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
              isPositiveReserve={isPositiveReserve}
              onAcceptBid={handleAcceptBid}
              setNewSessionState={setNewSessionState}
            />
          </Box>
        </div>
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Battery Information</DialogTitle>
        <DialogContent>
          {selectedBatteryData ? (
            <div>
              <p>
                <strong>Owner:</strong> {selectedBatteryData.owner}
              </p>
              <p>
                <strong>SoC (%):</strong> {selectedBatteryData.soc}
              </p>
              <p>
                <strong>Capacity (KWh):</strong> {selectedBatteryData.capacity}
              </p>
            </div>
          ) : (
            <p>No data available</p>
          )}
        </DialogContent>
      </Dialog>

      {showReceiptDetails && (
        <Dialog
          open={showReceiptDetails}
          onClose={handleCloseReceiptDetails}
          maxWidth="md" // Puoi scegliere 'lg' o un altro valore se necessario
          fullWidth // Espande il dialog su tutta la larghezza del contenitore
        >
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
