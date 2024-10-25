import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import axios from "axios";
import RegisteredBatteryTable from "../../components/Tables/RegisteredBatteryTable";
import LayoutPreRegistration from "../../components/Layouts/LayoutPreRegistration";
import LayoutPostRegistration from "../../components/Layouts/LayoutPostRegistration";
import batteriesData from "../../db/batteries.json";

interface PreSimulationPageProps {
  onStartSimulation: () => void; // Prop per avviare la simulazione
}

const PreSimulationPage: React.FC<PreSimulationPageProps> = ({
  onStartSimulation,
}) => {
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
      // Ciclo sincrono per registrare ogni batteria in ordine
      for (let idx = 0; idx < batteriesData.length; idx++) {
        const battery = batteriesData[idx];

        await axios.post("/api/registerBattery", {
          address: batteryAddresses[idx],
          capacity: battery.capacity,
          SoC: battery.SoC,
        });
      }

      setBatteriesRegistered(true); // Imposta lo stato su registrate
    } catch (error) {
      console.error("Error registering batteries:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-8"
      style={{ textAlign: "center", marginBottom: "40px" }}
    >
      {/* Sezione principale */}
      {!batteriesRegistered ? (
        <div>
          {/* Pulsante "Register Batteries" */}
          <Button
            variant="contained"
            color="success"
            sx={{ borderRadius: "200px", padding: "10px 20px" }}
            onClick={handleRegisterBatteries}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register Batteries"}
          </Button>

          <LayoutPreRegistration handleOpenDialog={handleOpenDialog} />
        </div>
      ) : (
        <div>
          {/* Pulsante "Start Simulation" */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "200px",
              padding: "10px 20px",
              marginBottom: "40px",
            }}
            onClick={onStartSimulation} // Chiamata alla funzione per cambiare pagina
          >
            Start Simulation
          </Button>

          {/* Layout post-registrazione */}
          <LayoutPostRegistration handleOpenDialog={handleOpenDialog} />

          {/* tabella batterie registrate */}
          <div style={{ marginTop: "40px" }}>
            <RegisteredBatteryTable />
          </div>
        </div>
      )}

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
