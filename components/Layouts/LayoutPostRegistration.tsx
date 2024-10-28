import React from "react";
import Battery from "../Battery/Battery";
import Image from "next/image";
import aggregatorImg from "../../public/aggregator.png";
import batteriesData from "../../db/batteries.json";

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
            <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
          ))}
        {batteriesData
          .slice(5, Math.min(visibleBatteriesCount, 10))
          .map((battery, idx) => (
            <Battery key={idx} onClick={() => handleOpenDialog(idx + 5)} />
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
            <Battery key={idx} onClick={() => handleOpenDialog(idx + 10)} />
          ))}
        {batteriesData
          .slice(15, Math.min(visibleBatteriesCount, 20))
          .map((battery, idx) => (
            <Battery key={idx} onClick={() => handleOpenDialog(idx + 15)} />
          ))}
      </div>
    </div>
  );
};

export default LayoutPostRegistration;
