import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import RegisteredBatteryTable from "../../components/Tables/RegisteredBatteryTable";
import LayoutPreRegistration from "../../components/Layouts/LayoutPreRegistration";
import LayoutPostRegistration from "../../components/Layouts/LayoutPostRegistration";
import batteriesData from "../../db/batteries.json";

interface PreSimulationPageProps {
  onStartSimulation: () => void;
  onProceedToNextStep: (step: number) => void;
  activeStep: number;
}

const PreSimulationPage: React.FC<PreSimulationPageProps> = ({
  onStartSimulation,
  onProceedToNextStep,
  activeStep,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBatteryIndex, setSelectedBatteryIndex] = useState<
    number | null
  >(null);
  const [batteriesRegistered, setBatteriesRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [batteryAddresses, setBatteryAddresses] = useState<string[]>([]);
  const [visibleBatteriesCount, setVisibleBatteriesCount] = useState(0);
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
    onProceedToNextStep(1);
    try {
      for (let idx = 0; idx < batteriesData.length; idx++) {
        const battery = batteriesData[idx];
        await axios.post("/api/registerBattery", {
          address: batteryAddresses[idx],
          capacity: battery.capacity,
          SoC: battery.SoC,
        });
        setVisibleBatteriesCount((prev) => prev + 1);
        setUpdateTable((prev) => !prev);
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
      {activeStep === 0 && !batteriesRegistered ? (
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
          <Box
            sx={{
              width: "80%",
              maxHeight: 400,
              overflowY: "auto",
              marginTop: "20px",
              padding: 2,
              backgroundColor: "#f5f5f5",
              boxShadow: 3,
              borderRadius: 2,
              mx: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Registered Batteries
            </Typography>
            <RegisteredBatteryTable updateTable={updateTable} />
          </Box>
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
