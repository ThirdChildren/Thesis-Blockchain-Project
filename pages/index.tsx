import React, { useState } from "react";
import PreSimulationPage from "./user/preSimulationPage";
import SimulationPage from "./user/simulationPage";
import { Stepper, Step, StepLabel } from "@mui/material";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BatterySaverIcon from "@mui/icons-material/BatterySaver";

// Stepper icons
const CustomStepIcon = ({
  icon,
  completed,
}: {
  icon: JSX.Element;
  completed: boolean;
}) => (
  <div
    style={{
      backgroundColor: completed ? "#4caf50" : "#e0e0e0",
      borderRadius: "50%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: completed ? "#fff" : "#000",
      width: "40px",
      height: "40px",
    }}
  >
    {icon}
  </div>
);

const HomePage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Steps
  const steps = [
    "Batteries Pre-Registration",
    "Batteries Aggregation",
    "Market Simulation",
  ];

  const icons = [
    <BatteryFullIcon style={{ fontSize: "24px" }} />,
    <BatterySaverIcon style={{ fontSize: "24px" }} />,
    <AccessTimeIcon style={{ fontSize: "24px" }} />,
  ];

  // Function to start simulation on the last step
  const handleStartSimulation = () => {
    setActiveStep(2); // Move to the third step (simulation)
  };

  // Function to proceed to the next step from PreSimulationPage
  const onProceedToNextStep = (step: number) => {
    setActiveStep(step);
  };

  return (
    <div
      className={`min-h-screen py-8 flex flex-col items-center`}
      style={{
        backgroundColor: activeStep === 2 ? "#2B2930" : "white",
      }}
    >
      <h1
        className={`text-3xl font-bold ${
          activeStep === 2 ? "text-white" : "text-black"
        } transition-colors duration-300`}
        style={{ marginBottom: "20px" }}
      >
        Blockchain based aFRR Energy Market
      </h1>
      <div style={{ width: "100%", marginTop: "20px", textAlign: "center" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                StepIconComponent={() => (
                  <CustomStepIcon
                    icon={icons[index]}
                    completed={activeStep > index}
                  />
                )}
                sx={{
                  "& .MuiStepLabel-label": {
                    color: activeStep === 2 ? "#fff" : "inherit", // Cambia colore in bianco se siamo all'ultimo step
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      {activeStep === 2 ? (
        <SimulationPage />
      ) : (
        <PreSimulationPage
          onStartSimulation={handleStartSimulation}
          onProceedToNextStep={onProceedToNextStep}
          activeStep={activeStep}
        />
      )}
    </div>
  );
};

export default HomePage;
