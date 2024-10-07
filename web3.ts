import Web3 from "web3";
import AggregatorContract from "./contracts/Aggregator.json";
import TSOContract from "./contracts/TSO.json";
import dotenv from "dotenv";

dotenv.config();

const ganacheUrl = process.env.GANACHE_URL || "http://172.20.208.1:7545/"; // URL del nodo Ganache
const web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));

// Account e chiavi private da Ganache
const accountsData = [
  {
    name: "Aggregator Admin",
    account: process.env.AGGREGATOR_ADMIN_ACCOUNT,
    privateKey: process.env.AGGREGATOR_ADMIN_PRIVATE_KEY,
  },
  {
    name: "TSO Admin",
    account: process.env.TSO_ADMIN_ACCOUNT,
    privateKey: process.env.TSO_ADMIN_PRIVATE_KEY,
  },
  {
    name: "Account 1",
    account: process.env.ACCOUNT_1_ADDRESS,
    privateKey: process.env.ACCOUNT_1_PRIVATE_KEY,
  },
  {
    name: "Account 2",
    account: process.env.ACCOUNT_2_ADDRESS,
    privateKey: process.env.ACCOUNT_2_PRIVATE_KEY,
  },
  {
    name: "Account 3",
    account: process.env.ACCOUNT_3_ADDRESS,
    privateKey: process.env.ACCOUNT_3_PRIVATE_KEY,
  },
  {
    name: "Account 4",
    account: process.env.ACCOUNT_4_ADDRESS,
    privateKey: process.env.ACCOUNT_4_PRIVATE_KEY,
  },
  {
    name: "Account 5",
    account: process.env.ACCOUNT_5_ADDRESS,
    privateKey: process.env.ACCOUNT_5_PRIVATE_KEY,
  },
  {
    name: "Account 6",
    account: process.env.ACCOUNT_6_ADDRESS,
    privateKey: process.env.ACCOUNT_6_PRIVATE_KEY,
  },
  {
    name: "Account 7",
    account: process.env.ACCOUNT_7_ADDRESS,
    privateKey: process.env.ACCOUNT_7_PRIVATE_KEY,
  },
  {
    name: "Account 8",
    account: process.env.ACCOUNT_8_ADDRESS,
    privateKey: process.env.ACCOUNT_8_PRIVATE_KEY,
  },
  {
    name: "Account 9",
    account: process.env.ACCOUNT_9_ADDRESS,
    privateKey: process.env.ACCOUNT_9_PRIVATE_KEY,
  },
  {
    name: "Account 10",
    account: process.env.ACCOUNT_10_ADDRESS,
    privateKey: process.env.ACCOUNT_10_PRIVATE_KEY,
  },
  {
    name: "Account 11",
    account: process.env.ACCOUNT_11_ADDRESS,
    privateKey: process.env.ACCOUNT_11_PRIVATE_KEY,
  },
  {
    name: "Account 12",
    account: process.env.ACCOUNT_12_ADDRESS,
    privateKey: process.env.ACCOUNT_12_PRIVATE_KEY,
  },
  {
    name: "Account 13",
    account: process.env.ACCOUNT_13_ADDRESS,
    privateKey: process.env.ACCOUNT_13_PRIVATE_KEY,
  },
  {
    name: "Account 14",
    account: process.env.ACCOUNT_14_ADDRESS,
    privateKey: process.env.ACCOUNT_14_PRIVATE_KEY,
  },
  {
    name: "Account 15",
    account: process.env.ACCOUNT_15_ADDRESS,
    privateKey: process.env.ACCOUNT_15_PRIVATE_KEY,
  },
  {
    name: "Account 16",
    account: process.env.ACCOUNT_16_ADDRESS,
    privateKey: process.env.ACCOUNT_16_PRIVATE_KEY,
  },
  {
    name: "Account 17",
    account: process.env.ACCOUNT_17_ADDRESS,
    privateKey: process.env.ACCOUNT_17_PRIVATE_KEY,
  },
  {
    name: "Account 18",
    account: process.env.ACCOUNT_18_ADDRESS,
    privateKey: process.env.ACCOUNT_18_PRIVATE_KEY,
  },
  {
    name: "Account 19",
    account: process.env.ACCOUNT_19_ADDRESS,
    privateKey: process.env.ACCOUNT_19_PRIVATE_KEY,
  },
  {
    name: "Account 20",
    account: process.env.ACCOUNT_20_ADDRESS,
    privateKey: process.env.ACCOUNT_20_PRIVATE_KEY,
  },
];

// Sblocca gli account utilizzando le chiavi private
accountsData.forEach((acc) => {
  if (acc.privateKey) {
    web3.eth.accounts.wallet.add(acc.privateKey);
  }
});

// Indirizzi dei contratti (passati dal deploy)
const aggregatorContractAddress = process.env.AGGREGATOR_CONTRACT_ADDRESS;
const tsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;

// Crea le istanze dei contratti
const aggregatorContract = new web3.eth.Contract(
  AggregatorContract.abi,
  aggregatorContractAddress
);

const tsoContract = new web3.eth.Contract(TSOContract.abi, tsoContractAddress);

// Funzione per ottenere gli account
export const getAccounts = () => {
  const accounts: {
    [key: string]: {
      address: string | undefined;
      privateKey: string | undefined;
    };
  } = {};

  accountsData.forEach((acc) => {
    accounts[acc.name] = {
      address: acc.account,
      privateKey: acc.privateKey,
    };
  });

  return accounts;
};

// Esporta i contratti e gli account
export { web3, aggregatorContract, tsoContract };
