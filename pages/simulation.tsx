import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import SimulationClock from "../components/Clock/SimulationClock";
import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import marketOptionsData from "../db/marketOptions.json";
import bidsData from "../db/bidsData.json"; // Importa le bids per sessione
import axios from "axios";
import PlacedBidsTable from "../components/Tables/PlacedBidsTable"; // Importa la tabella

const SimulationPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [currentMarket, setCurrentMarket] = useState(marketOptionsData[0]);
  const [showTable, setShowTable] = useState(false);

  const handleSimulationEnd = async () => {
    try {
      const response = await axios.post("/api/closeMarket");
      console.log("Market closed:", response.data);

      router.push("/accept-bids");
    } catch (error) {
      console.error("Error closing market:", error);
    }
  };

  // Funzione per gestire l'apertura del modal info
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Funzione per chiudere il modal info
  const handleClose = () => {
    setOpen(false);
  };

  // Funzione per gestire l'apertura del modal per selezionare la sessione
  const handleOpenSessionModal = () => {
    setOpenSessionModal(true);
  };

  // Funzione per chiudere il modal della sessione e avviare il timer
  const handleSessionSelect = async () => {
    setOpenSessionModal(false);
    if (selectedSession !== null) {
      // Imposta i dati del mercato in base alla sessione selezionata
      const selectedMarket = marketOptionsData[selectedSession - 1];
      setCurrentMarket(selectedMarket);

      // Chiamata all'API per aprire il mercato con i dati correnti
      await axios.post("/api/openMarket", selectedMarket);

      // Avvia la simulazione e il processo di bidding
      startBiddingProcess(selectedSession);
    }
  };

  // Funzione per gestire la selezione della sessione
  const handleSessionChange = (sessionNumber: number) => {
    setSelectedSession(sessionNumber);
  };

  // Avvio della simulazione e piazzamento delle bid
  const startBiddingProcess = (sessionNumber: number) => {
    const bidsForSession =
      bidsData[`session${sessionNumber}` as keyof typeof bidsData];
    if (!bidsForSession) {
      console.error("No bids found for the selected session");
      return;
    }

    let bidIndex = 0;
    const totalBids = bidsForSession.length;
    const bidInterval = (15 * 60 * 1000) / (totalBids * 10); // 15 minuti a velocità 10x, divisi per il numero di bids

    const interval = setInterval(() => {
      if (bidIndex < totalBids) {
        const bid = bidsForSession[bidIndex];
        axios.post("/api/placeBid", bid).then(() => {
          console.log("Bid placed:", bid);
        });
        bidIndex++;
      } else {
        clearInterval(interval);
      }
    }, bidInterval);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Simulation in progress</h1>

      {/* Pulsante per selezionare la sessione */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenSessionModal}
      >
        Select Session
      </Button>

      {/* Modal per selezionare la sessione */}
      <Dialog
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        aria-labelledby="session-select-dialog"
      >
        <DialogTitle id="session-select-dialog">Session n.</DialogTitle>
        <DialogContent>
          <FormGroup>
            {[1, 2, 3, 4].map((session) => (
              <FormControlLabel
                key={session}
                control={
                  <Checkbox
                    checked={selectedSession === session}
                    onChange={() => handleSessionChange(session)}
                  />
                }
                label={`Session ${session}`}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSessionSelect}
            color="primary"
            variant="contained"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Timer */}
      {selectedSession !== null && (
        <SimulationClock onEnd={handleSimulationEnd} />
      )}

      {/* Icona Info per aprire il modal */}
      <IconButton
        color="primary"
        aria-label="market info"
        onClick={handleClickOpen}
        size="large"
        className="mt-6"
      >
        <InfoIcon style={{ fontSize: "40px" }} />
      </IconButton>

      {/* Pulsante Show Table */}
      <Button
        variant="contained"
        color="secondary"
        className="mt-4"
        onClick={() => setShowTable(!showTable)}
      >
        Show Table
      </Button>

      {/* Modal per visualizzare le informazioni del mercato */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="market-info-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="market-info-dialog">Market Information</DialogTitle>
        <DialogContent>
          <p>
            <strong>Required Energy:</strong> {currentMarket.requiredEnergy} kWh
          </p>
          <p>
            <strong>Is Positive Reserve:</strong>{" "}
            {currentMarket.isPositiveReserve ? "Yes" : "No"}
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tabella delle bid */}
      {showTable && <PlacedBidsTable />}
    </div>
  );
};

export default SimulationPage;
