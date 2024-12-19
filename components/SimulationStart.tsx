import { useState } from "react";
import { Button, IconButton } from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import { useRouter } from "next/router";
import RegisteredBatteryTable from "./Tables/RegisteredBatteryTable";

const SimulationStart = () => {
  const [showTable, setShowTable] = useState(false);
  const router = useRouter();

  const handleStartSimulation = () => {
    // Reindirizza direttamente alla route /simulation
    router.push("/simulation");
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-4">Simulation start</h2>
      <div className="flex flex-col items-center justify-center mb-8">
        {/* Bottone per avviare la simulazione */}
        <IconButton
          color="secondary"
          onClick={handleStartSimulation}
          size="large"
        >
          <TimerIcon style={{ fontSize: "40px" }} />
        </IconButton>
      </div>
      <div className="flex flex-col items-center justify-center mb-8">
        {/* Bottone per mostrare/nascondere la tabella */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowTable((prev) => !prev)}
          className="mb-4"
        >
          {showTable ? "Hide Battery Table" : "Show Battery Table"}
        </Button>

        {/* Se showTable è true, mostra la tabella */}
        {showTable && (
          <div className="w-full max-w-4xl mt-4">
            <RegisteredBatteryTable />
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationStart;
