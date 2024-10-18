import React, { useState, useEffect } from "react";
import Battery from "../../components/Battery/Battery";
import Image from "next/image";
import aggregatorImg from "./../../public/aggregator.png";
import tsoImg from "./../../public/tso.png";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import axios from "axios";
import RegisteredBatteryTable from "../../components/Tables/RegisteredBatteryTable";

import batteriesData from "../../db/batteries.json";

const PreSimulationPage: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [batteriesRegistered, setBatteriesRegistered] = useState(false); // Stato per sapere se le batterie sono state registrate
  const [loading, setLoading] = useState(false);
  const [batteryAddresses, setBatteryAddresses] = useState<string[]>([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get("/api/getBatteryAddresses");
        setBatteryAddresses(response.data.addresses);
      } catch (error) {
        console.error("Error fetching battery addresses", error);
      }
    };

    fetchAddresses();
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

  // Funzione per registrare tutte le batterie
  const handleRegisterBatteries = async () => {
    setLoading(true);

    try {
      // Manda una richiesta API per ogni batteria
      const registrationPromises = batteriesData.map((battery, idx) =>
        axios.post("/api/registerBattery", {
          address: batteryAddresses[idx], // Indirizzo del proprietario della batteria
          capacity: battery.capacity,
          SoC: battery.SoC,
        })
      );

      // Attendi la registrazione di tutte le batterie
      await Promise.all(registrationPromises);

      setBatteriesRegistered(true); // Imposta lo stato su registrate
    } catch (error) {
      console.error("Error registering batteries:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8">
      {/* Pulsante "Register Batteries" */}
      {!batteriesRegistered && (
        <div>
          <Button
            variant="contained"
            color="success"
            sx={{ borderRadius: "200px", padding: "10px 20px" }}
            onClick={handleRegisterBatteries} // Aggiungi l'azione di click
            disabled={loading} // Disabilita il pulsante durante il caricamento
          >
            {loading ? "Registering..." : "Register Batteries"}
          </Button>
        </div>
      )}

      {/* Pulsante "Start Simulation" se le batterie sono state registrate */}
      {batteriesRegistered && (
        <div>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: "200px", padding: "10px 20px" }}
          >
            Start Simulation
          </Button>
        </div>
      )}

      {/* Sezione principale */}
      <div className="flex-grow flex items-center justify-center w-full">
        <div className="grid grid-cols-3 gap-8 w-full max-w-screen-lg">
          {/* Sezione Batterie (colonna sinistra) */}
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {batteriesData.slice(0, 10).map((battery, idx) => (
                <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {batteriesData.slice(10, 20).map((battery, idx) => (
                <Battery key={idx} onClick={() => handleOpenDialog(idx + 10)} />
              ))}
            </div>
          </div>

          {/* Sezione Aggregator (colonna centrale) */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-bold text-lg mb-4">AGGREGATOR</h2>
            <Image
              src={aggregatorImg}
              alt="Aggregator"
              className="w-64 h-64 object-contain"
            />
          </div>

          {/* Sezione TSO (colonna destra) */}
          <div className="flex flex-col items-center justify-center">
            <h2 className="font-bold text-lg mb-4">TSO</h2>
            <Image
              src={tsoImg}
              alt="TSO"
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Tabella delle batterie registrate */}
      {batteriesRegistered && <RegisteredBatteryTable />}

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

export default PreSimulationPage;
