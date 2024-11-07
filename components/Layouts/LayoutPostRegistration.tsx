import React from "react";
import Battery from "../Battery/Battery";
import Image from "next/image";
import aggregatorImg from "../../public/aggregator.png";
import batteriesData from "../../db/batteries.json";
import { Typography } from "@mui/material";

interface LayoutPostRegistrationProps {
  handleOpenDialog: (index: number) => void;
  visibleBatteriesCount: number;
}

const LayoutPostRegistration: React.FC<LayoutPostRegistrationProps> = ({
  handleOpenDialog,
  visibleBatteriesCount,
}) => {
  return (
    <div className="flex-grow flex items-center justify-center w-full">
      <div className="grid grid-cols-2 gap-4 mr-8">
        {batteriesData
          .slice(0, Math.min(visibleBatteriesCount, 5))
          .map((battery, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold"
                style={{
                  color: "#83f765",
                  backgroundColor: "#428f2f",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Battery {idx + 1}
              </Typography>
            </div>
          ))}
        {batteriesData
          .slice(5, Math.min(visibleBatteriesCount, 10))
          .map((battery, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 5)} />
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold"
                style={{
                  color: "#83f765",
                  backgroundColor: "#428f2f",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Battery {idx + 6}
              </Typography>
            </div>
          ))}
      </div>
      <div className="flex flex-col items-center justify-center mx-8">
        <h2 className="font-bold text-lg mb-4">AGGREGATOR</h2>
        <Image
          src={aggregatorImg}
          alt="Aggregator"
          className="w-64 h-64 object-contain"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 ml-8">
        {batteriesData
          .slice(10, Math.min(visibleBatteriesCount, 15))
          .map((battery, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 10)} />
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold"
                style={{
                  color: "#83f765",
                  backgroundColor: "#428f2f",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Battery {idx + 11}
              </Typography>
            </div>
          ))}
        {batteriesData
          .slice(15, Math.min(visibleBatteriesCount, 20))
          .map((battery, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 15)} />
              <Typography
                variant="caption"
                className="mt-1 text-white font-semibold"
                style={{
                  color: "#83f765",
                  backgroundColor: "#428f2f",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Battery {idx + 16}
              </Typography>
            </div>
          ))}
      </div>
    </div>
  );
};

export default LayoutPostRegistration;
