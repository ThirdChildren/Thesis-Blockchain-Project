import { useEffect } from "react";
import { useRouter } from "next/router";
import SimulationClock from "../components/Clock/SimulationClock"; // Importiamo il componente del timer

const SimulationPage = () => {
  const router = useRouter();

  // Callback da eseguire quando il timer finisce
  const handleSimulationEnd = () => {
    // Reindirizza l'utente alla home quando la simulazione termina
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Simulation in progress</h1>
      {/* Mostra il timer */}
      <SimulationClock onEnd={handleSimulationEnd} />
    </div>
  );
};

export default SimulationPage;
