import { Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const BatteryGrid = () => {
  const owners = Array.from({ length: 20 }, (_, i) => `Owner ${i + 1}`);

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {owners.map((owner, index) => (
        <div
          key={index}
          className="bg-gray-100 rounded-lg shadow-md p-4 flex flex-col items-center justify-center"
        >
          <PersonIcon className="h-12 w-12 text-blue-500" />
          <p className="mt-2 text-lg">{owner}</p>
          <Button variant="contained" color="primary" className="mt-4">
            Register Battery
          </Button>
        </div>
      ))}
    </div>
  );
};

export default BatteryGrid;
