import Web3 from "web3";
import AggregatorContract from "./contracts/Aggregator.json";
import TSOContract from "./contracts/TSO.json";
import dotenv from "dotenv";

dotenv.config();

const ganacheUrl = process.env.GANACHE_URL || "http://172.20.208.1:7545/"; // URL del nodo Ganache
const web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));

// Estrai gli indirizzi e le chiavi private dai vari account di Ganache
const tsoAdminAccount = process.env.TSO_ADMIN_ACCOUNT;
const account1 = process.env.ACCOUNT_1_ADDRESS;
const account2 = process.env.ACCOUNT_2_ADDRESS;
const account3 = process.env.ACCOUNT_3_ADDRESS;
const account4 = process.env.ACCOUNT_4_ADDRESS;
const account5 = process.env.ACCOUNT_5_ADDRESS;
const privateKeyTsoAdmin = process.env.TSO_ADMIN_PRIVATE_KEY;
const privateKey1 = process.env.ACCOUNT_1_PRIVATE_KEY;
const privateKey2 = process.env.ACCOUNT_2_PRIVATE_KEY;
const privateKey3 = process.env.ACCOUNT_3_PRIVATE_KEY;
const privateKey4 = process.env.ACCOUNT_4_PRIVATE_KEY;
const privateKey5 = process.env.ACCOUNT_5_PRIVATE_KEY;

// Sblocca gli account utilizzando le chiavi private
web3.eth.accounts.wallet.add(privateKeyTsoAdmin!);
web3.eth.accounts.wallet.add(privateKey1!);
web3.eth.accounts.wallet.add(privateKey2!);
web3.eth.accounts.wallet.add(privateKey3!);
web3.eth.accounts.wallet.add(privateKey4!);
web3.eth.accounts.wallet.add(privateKey5!);

// Indirizzi dei contratti (passati dal deploy)
const aggregatorContractAddress = process.env.AGGREGATOR_CONTRACT_ADDRESS;
const tsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;

// Crea le istanze dei contratti
const aggregatorContract = new web3.eth.Contract(
  AggregatorContract.abi,
  aggregatorContractAddress
);

const tsoContract = new web3.eth.Contract(TSOContract.abi, tsoContractAddress);

export const getAccounts = () => {
  return {
    tsoAdminAccount: {
      address: tsoAdminAccount,
      privateKey: privateKeyTsoAdmin,
    },
    account1: {
      address: account1,
      privateKey: privateKey1,
    },
    account2: {
      address: account2,
      privateKey: privateKey2,
    },
    account3: {
      address: account3,
      privateKey: privateKey3,
    },
    account4: {
      address: account4,
      privateKey: privateKey4,
    },
    account5: {
      address: account5,
      privateKey: privateKey5,
    },
  };
};

// Esporta i contratti e gli account
export { web3, aggregatorContract, tsoContract };
