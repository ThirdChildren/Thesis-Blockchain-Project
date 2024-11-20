import React from "react";
import Battery from "../Battery/Battery";
import BatterySemiFull from "../Battery/BatterySemiFull";
import BatteryHalfFull from "../Battery/BatteryHalfFull";
import BatterySemiEmpty from "../Battery/BatterySemiEmpty";
import BatteryEmpty from "../Battery/BatteryEmpty";
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
          {batteriesData.slice(0, 20).map((battery, idx) => {
            let BatteryComponent;

            if (battery.SoC >= 80) {
              BatteryComponent = Battery;
            } else if (battery.SoC >= 60) {
              BatteryComponent = BatterySemiFull;
            } else if (battery.SoC >= 40) {
              BatteryComponent = BatteryHalfFull;
            } else if (battery.SoC >= 20) {
              BatteryComponent = BatterySemiEmpty;
            } else {
              BatteryComponent = BatteryEmpty;
            }

            return (
              <div key={idx} className="flex flex-col items-center">
                <BatteryComponent onClick={() => handleOpenDialog(idx)} />
                <Typography
                  variant="caption"
                  className="mt-1 text-white font-semibold"
                  style={{
                    color: "#83f765",
                    backgroundColor: "#428f2f",
                    padding: "2px 1px",
                    borderRadius: "4px",
                    textAlign: "center",
                  }}
                >
                  Battery {idx + 1}
                </Typography>
              </div>
            );
          })}
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
