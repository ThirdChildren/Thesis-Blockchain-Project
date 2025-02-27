import { useState } from "react";
import { Stepper, Step, StepLabel, Button, Typography } from "@mui/material";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BatteryGrid from "../../components/BatteryGrid";
import SimulationStart from "../../components/SimulationStart";

const CustomStepIcon = ({
  icon,
  completed,
}: {
  icon: JSX.Element;
  completed: boolean;
}) => {
  return (
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
};

const StepperComponent = () => {
  const steps = [
    "Register batteries",
    "Start simulation - Place Bids",
    "TSO: Select Bids & Pay",
  ];
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const icons = [
    <BatteryFullIcon style={{ fontSize: "24px" }} />,
    <AccessTimeIcon style={{ fontSize: "24px" }} />,
    <AttachMoneyIcon style={{ fontSize: "24px" }} />,
  ];

  return (
    <div style={{ width: "100%", marginTop: "50px", textAlign: "center" }}>
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
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length ? (
        <div>
          <Typography variant="h6">All steps completed</Typography>
          <Button
            onClick={handleReset}
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
          >
            Reset
          </Button>
        </div>
      ) : (
        <div>
          {/* Mostra BatteryGrid solo nel primo step */}
          {activeStep === 0 && <BatteryGrid />}

          {/* Mostra la tabella delle batterie registrate nel secondo step */}
          {activeStep === 1 && <SimulationStart />}

          <div style={{ marginTop: "20px" }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="contained"
              style={{ marginRight: "10px" }}
            >
              Back
            </Button>
            <Button onClick={handleNext} variant="contained" color="primary">
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepperComponent;
