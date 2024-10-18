import React from "react";
import Battery from "../Battery/Battery";
import Image from "next/image";
import aggregatorImg from "../../public/aggregator.png";
import tsoImg from "../../public/tso.png";
import batteriesData from "../../db/batteries.json";

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
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {batteriesData.slice(0, 10).map((battery, idx) => (
              <Battery key={idx} onClick={() => handleOpenDialog(idx)} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {batteriesData.slice(10, 20).map((battery, idx) => (
              <Battery key={idx} onClick={() => handleOpenDialog(idx + 10)} />
            ))}
          </div>
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
          <h2 className="font-bold text-lg mb-4">TSO</h2>
          <Image src={tsoImg} alt="TSO" className="w-64 h-64 object-contain" />
        </div>
      </div>
    </div>
  );
};

export default LayoutPreRegistration;
