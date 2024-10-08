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
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import marketOptionsData from "../db/marketOptions.json";
import axios from "axios";

const SimulationPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [currentMarket, setCurrentMarket] = useState(marketOptionsData[0]);

  const handleSimulationEnd = async () => {
    try {
      // Chiamata API per chiudere il mercato
      const response = await axios.post("/api/closeMarket");
      console.log("Market closed:", response.data);

      // Reindirizza l'utente alla route /accept-bids dopo aver chiuso il mercato
      router.push("/accept-bids");
    } catch (error) {
      console.error("Error closing market:", error);
    }
  };

  // Funzione per gestire l'apertura del modal
  const handleClickOpen = () => {
    setOpen(true);
  };

  // Funzione per chiudere il modal
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Simulation in progress</h1>

      {/* Mostra il timer */}
      <SimulationClock onEnd={handleSimulationEnd} />

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
    </div>
  );
};

export default SimulationPage;
