import { useState, useEffect } from "react";

interface SimulationClockProps {
  onEnd: () => void; // Callback da chiamare quando la simulazione termina
}

const SimulationClock = ({ onEnd }: SimulationClockProps) => {
  const simulationDuration = 15 * 60; // 15 minuti in secondi
  const simulationSpeed = 10; // velocità 10x

  const [timeRemaining, setTimeRemaining] = useState(simulationDuration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(interval);
          onEnd(); // Chiama la callback quando il timer finisce
          return 0;
        }
      });
    }, 1000 / simulationSpeed); // Aggiorna ogni secondo a velocità 10x

    return () => clearInterval(interval); // Pulisce l'intervallo quando il componente viene smontato
  }, [onEnd]);

  // Formattare il tempo in minuti e secondi
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Simulation Time Remaining</h2>
      <div className="text-4xl font-mono bg-gray-800 text-white px-6 py-2 rounded-lg shadow-md">
        {formatTime(timeRemaining)}
      </div>
    </div>
  );
};

export default SimulationClock;
