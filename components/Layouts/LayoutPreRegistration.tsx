import React from "react";
import Battery from "../Battery/Battery";
import Image from "next/image";
import aggregatorImg from "../../public/aggregator.png";
import energyGridImg from "../../public/smartgrid.png";
import batteriesData from "../../db/batteries.json";
import { Typography } from "@mui/material";

interface LayoutPreRegistrationProps {
  handleOpenDialog: (index: number) => void;
}

const LayoutPreRegistration: React.FC<LayoutPreRegistrationProps> = ({
  handleOpenDialog,
}) => {
  return (
    <div className="flex-grow flex items-center justify-center w-full">
      <div className="grid grid-cols-3 gap-8 w-full max-w-screen-lg">
        {/* Sezione Batterie (colonna sinistra) */}
        <div className="grid grid-cols-4 gap-4">
          {batteriesData.slice(0, 20).map((battery, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold"
                style={{
                  color: "#83f765",
                  backgroundColor: "#428f2f",
                  padding: "2px 2px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Battery {idx + 1}
              </Typography>
            </div>
          ))}
        </div>

        {/* Sezione Aggregator (colonna centrale) */}
        <div className="flex flex-col items-center justify-center">
          <h2 className="font-bold text-lg mb-4">AGGREGATOR</h2>
          <Image
            src={aggregatorImg}
            alt="Aggregator"
            className="w-64 h-64 object-contain"
          />
        </div>

        {/* Sezione TSO (colonna destra) */}
        <div className="flex flex-col items-center justify-center">
          <h2 className="font-bold text-lg mb-4">POWER GRID</h2>
          <Image
            src={energyGridImg}
            alt="TSO"
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default LayoutPreRegistration;
