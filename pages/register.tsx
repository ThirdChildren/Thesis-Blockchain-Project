import { useState } from "react";
import axios from "axios";

const users = [
  { name: "User 1", address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
  { name: "User 2", address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906" },
  { name: "User 3", address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" },
  { name: "User 4", address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" },
  { name: "User 5", address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9" },
];

const RegisterBatteries = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const registerBattery = async (address: string) => {
    setLoading(true);
    setMessage("");

    const batteryData = {
      owner: address,
      capacity: 100, // Puoi modificare questo valore
      SoC: 50, // Puoi modificare questo valore
    };

    try {
      const response = await axios.post("/api/registerBattery", batteryData);
      setMessage(`Battery registered successfully: ${response.data.txHash}`);
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.error || (error as any).message;
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register Your Battery</h1>
      {users.map((user) => (
        <div key={user.address} style={{ margin: "10px 0" }}>
          <span>
            {user.name} ({user.address})
          </span>
          <button
            onClick={() => registerBattery(user.address)}
            disabled={loading}
            style={{ marginLeft: "10px" }}
          >
            {loading ? "Registering..." : "Register Your Battery"}
          </button>
        </div>
      ))}
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterBatteries;
