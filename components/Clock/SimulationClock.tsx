import { colors } from "@mui/material";
import { useState, useEffect } from "react";

interface SimulationClockProps {
  onEnd: () => void; // Callback da chiamare quando la simulazione termina
  reset: boolean; // Proprietà per il reset del timer
}

const SimulationClock = ({ onEnd, reset }: SimulationClockProps) => {
  const simulationDuration = 15 * 60; // 15 minuti in secondi
  const simulationSpeed = 10; // velocità 10x

  const [timeRemaining, setTimeRemaining] = useState(simulationDuration);

  useEffect(() => {
    if (reset) {
      setTimeRemaining(simulationDuration); // Reset the timer to the initial duration
    }
  }, [reset]);

  useEffect(() => {
    if (timeRemaining === 0) {
      onEnd(); // Chiama la callback quando il timer finisce
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => prevTime - 1);
    }, 1000 / simulationSpeed);

    return () => clearInterval(interval); // Cleanup the interval on unmount or when timeRemaining changes
  }, [timeRemaining, onEnd, simulationSpeed]);

  // Format time in minutes and seconds
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
