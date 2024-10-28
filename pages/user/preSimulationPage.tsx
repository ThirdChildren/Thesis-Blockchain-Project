import React, { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent } from "@mui/material";
import axios from "axios";
import RegisteredBatteryTable from "../../components/Tables/RegisteredBatteryTable";
import LayoutPreRegistration from "../../components/Layouts/LayoutPreRegistration";
import LayoutPostRegistration from "../../components/Layouts/LayoutPostRegistration";
import batteriesData from "../../db/batteries.json";

interface PreSimulationPageProps {
  onStartSimulation: () => void;
}

const PreSimulationPage: React.FC<PreSimulationPageProps> = ({
  onStartSimulation,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [batteriesRegistered, setBatteriesRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batteryAddresses, setBatteryAddresses] = useState<string[]>([]);
  const [visibleBatteriesCount, setVisibleBatteriesCount] = useState(0); // Stato per contare le batterie visibili
  const [updateTable, setUpdateTable] = useState(false);

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

  const handleOpenDialog = (index: number) => {
    setSelectedBatteryIndex(index);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBatteryIndex(null);
  };

  const handleRegisterBatteries = async () => {
    setLoading(true);
    setBatteriesRegistered(true);
    try {
      for (let idx = 0; idx < batteriesData.length; idx++) {
        const battery = batteriesData[idx];

        await axios.post("/api/registerBattery", {
          address: batteryAddresses[idx],
          capacity: battery.capacity,
          SoC: battery.SoC,
        });

        // Incrementa visibleBatteriesCount per mostrare progressivamente le batterie registrate
        setVisibleBatteriesCount((prev) => prev + 1);

        // Aggiorna lo stato per notificare RegisteredBatteryTable
        setUpdateTable((prev) => !prev);

        // Aggiungi un breve delay per permettere il rendering visivo graduale
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
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
      {!batteriesRegistered ? (
        <div>
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
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: "200px",
              padding: "10px 20px",
              marginBottom: "40px",
            }}
            onClick={onStartSimulation}
          >
            Start Simulation
          </Button>
          <LayoutPostRegistration
            handleOpenDialog={handleOpenDialog}
            visibleBatteriesCount={visibleBatteriesCount}
          />
          <div style={{ marginTop: "40px" }}>
            <RegisteredBatteryTable updateTable={updateTable} />
          </div>
        </div>
      )}

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
