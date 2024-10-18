import React from "react";
import Battery from "../Battery/Battery";
import Image from "next/image";
import aggregatorImg from "../../public/aggregator.png";
import batteriesData from "../../db/batteries.json";

interface LayoutPostRegistrationProps {
  handleOpenDialog: (index: number) => void;
}

const LayoutPostRegistration: React.FC<LayoutPostRegistrationProps> = ({
  handleOpenDialog,
}) => {
  return (
    <div className="flex-grow flex items-center justify-center w-full">
      {/* Colonne delle batterie a sinistra dell'aggregator */}
      <div className="grid grid-cols-2 gap-4 mr-8">
        {batteriesData.slice(0, 5).map((battery, idx) => (
          <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
        ))}
        {batteriesData.slice(5, 10).map((battery, idx) => (
          <Battery key={idx} onClick={() => handleOpenDialog(idx + 5)} />
        ))}
      </div>

      {/* Sezione aggregatore centrale */}
      <div className="flex flex-col items-center justify-center mx-8">
        <h2 className="font-bold text-lg mb-4">AGGREGATOR</h2>
        <Image
          src={aggregatorImg}
          alt="Aggregator"
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* Colonne delle batterie a destra dell'aggregator */}
      <div className="grid grid-cols-2 gap-4 ml-8">
        {batteriesData.slice(10, 15).map((battery, idx) => (
          <Battery key={idx} onClick={() => handleOpenDialog(idx + 10)} />
        ))}
        {batteriesData.slice(15, 20).map((battery, idx) => (
          <Battery key={idx} onClick={() => handleOpenDialog(idx + 15)} />
        ))}
      </div>
    </div>
  );
};

export default LayoutPostRegistration;
