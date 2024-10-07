import { Button, Modal, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useState, useEffect } from "react";
import axios from "axios";
import batteriesData from "../db/batteries.json";

interface Battery {
  address: string;
  capacity: number;
  SoC: number;
}

const BatteryGrid = () => {
  const owners = Array.from({ length: 20 }, (_, i) => `Account ${i + 1}`);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<Battery | null>(null);
  const [accounts, setAccounts] = useState<{ name: string; address: string }[]>(
    []
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInfoModal, setIsInfoModal] = useState(false);

  // Recupera gli account dall'API all'inizio
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("/api/getAccounts"); // Chiama l'API per gli account
        setAccounts(response.data); // Imposta gli account nello stato
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts(); // Chiamata API
  }, []);

  // Funzione che cerca l'indirizzo in base al nome dell'account
  const getOwnerAddressByName = (accountName: string) => {
    const ownerAccount = accounts.find(
      (account) => account.name === accountName
    );
    return ownerAccount ? ownerAccount.address : "";
  };

  const handleRegisterBattery = async (index: number) => {
    const accountName = `Account ${index + 1}`;
    const ownerAddress = getOwnerAddressByName(accountName);
    const battery: Battery = {
      address: ownerAddress,
      capacity: batteriesData[index].capacity,
      SoC: batteriesData[index].SoC,
    };

    try {
      const response = await axios.post("/api/registerBattery", battery);
      // Se la registrazione è andata a buon fine, mostra i dettagli
      setSelectedBattery(battery);
      setErrorMessage(null); // Nessun errore
      setIsInfoModal(false); // È un'operazione di registrazione, non info
      setModalOpen(true);
    } catch (error) {
      // Controlla se l'errore è dovuto al fatto che la batteria è già registrata
      setErrorMessage("Battery already registered");
      setSelectedBattery(battery); // Mantieni i dati della batteria
      setIsInfoModal(false); // È un'operazione di registrazione, non info
      setModalOpen(true);
      console.error("Error registering battery:", error);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedBattery(null);
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {owners.map((owner, index) => (
        <div
          key={index}
          className="bg-gray-100 rounded-lg shadow-md p-4 flex flex-col items-center justify-center"
        >
          <PersonIcon className="h-12 w-12 text-blue-500" />
          <p className="mt-2 text-lg">{owner}</p>
          <Button
            variant="contained"
            color="primary"
            className="mt-4"
            onClick={() => handleRegisterBattery(index)}
          >
            Register Battery
          </Button>
          {/* Pulsante per mostrare i dettagli */}
          <Button
            variant="text"
            className="mt-2"
            onClick={() => {
              setSelectedBattery({
                address: getOwnerAddressByName(owner),
                ...batteriesData[index],
              });
              setErrorMessage(null); // Nessun errore da mostrare
              setIsInfoModal(true); // È un'operazione di visualizzazione info
              setModalOpen(true);
            }}
          >
            Info
          </Button>
        </div>
      ))}

      {/* Modale per i dettagli della batteria registrata */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <div className="flex justify-center items-center h-full">
          <div className="bg-white p-6 rounded shadow-lg">
            {selectedBattery && (
              <>
                <Typography variant="h6">
                  {isInfoModal
                    ? "Battery Details"
                    : errorMessage
                    ? "Error"
                    : "Battery Details"}
                </Typography>
                {errorMessage && !isInfoModal ? (
                  <Typography>{errorMessage}</Typography>
                ) : (
                  <>
                    <Typography>Address: {selectedBattery.address}</Typography>
                    <Typography>
                      Capacity: {selectedBattery.capacity}
                    </Typography>
                    <Typography>SoC: {selectedBattery.SoC}</Typography>
                  </>
                )}
                <Button
                  onClick={handleModalClose}
                  variant="contained"
                  color="primary"
                  className="mt-4"
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BatteryGrid;
