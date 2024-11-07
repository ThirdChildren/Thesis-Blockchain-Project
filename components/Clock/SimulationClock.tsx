import { useState, useEffect } from "react";

interface SimulationClockProps {
  onEnd: () => void; // Callback per quando la simulazione termina
  reset: boolean; // Proprietà per il reset del timer
}

const SimulationClock = ({ onEnd, reset }: SimulationClockProps) => {
  const simulationDuration = 15 * 60; // 15 minuti in secondi
  const simulationSpeed = 10; // Velocità 10x

  const [timeRemaining, setTimeRemaining] = useState(simulationDuration);
  const [isRunning, setIsRunning] = useState(true); // Controllo per avviare o fermare il timer

  useEffect(() => {
    if (reset) {
      setTimeRemaining(simulationDuration); // Resetta il timer alla durata iniziale
      setIsRunning(true); // Riavvia il timer
    }
  }, [reset]);

  useEffect(() => {
    if (!isRunning || timeRemaining === 0) {
      if (timeRemaining === 0) {
        onEnd(); // Chiama la callback solo quando il timer finisce
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval); // Cleanup dell’intervallo su unmount o cambio di tempo
  }, [timeRemaining, isRunning, onEnd, simulationSpeed]);

  // Formatta il tempo in minuti e secondi
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "white" }}>
        Simulation Time Remaining
      </h2>
      <div className="text-4xl font-mono bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md">
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
};

export default SimulationClock;
