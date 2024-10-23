import React, { useState } from "react";
import PreSimulationPage from "./user/preSimulationPage";
import SimulationPage from "./user/simulationPage";

const HomePage: React.FC = () => {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);

  // Funzione per avviare la simulazione e passare a SimulationPage
  const handleStartSimulation = () => {
    setIsSimulationStarted(true);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: isSimulationStarted ? "#2B2930" : "white", // Cambia colore del background
      }}
    >
      {isSimulationStarted ? (
        <SimulationPage />
      ) : (
        <PreSimulationPage onStartSimulation={handleStartSimulation} />
      )}
    </div>
  );
};

export default HomePage;
