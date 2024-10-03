"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const web3_1 = __importDefault(require("web3"));
const Aggregator_json_1 = __importDefault(require("../../contracts/Aggregator.json"));
const TSO_json_1 = __importDefault(require("../../contracts/TSO.json"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const web3 = new web3_1.default(process.env.HARDHAT_NETWORK_URL);
// Leggi gli indirizzi dei contratti dal file .env
const aggregatorContractAddress = process.env.AGGREGATOR_CONTRACT_ADDRESS;
const tsoContractAddress = process.env.TSO_CONTRACT_ADDRESS;
// Inizializzazione del server e del contratto
(() => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield web3.eth.getAccounts();
    const defaultAccount = accounts[0];
    const tsoAccount = accounts[1];
    const onlyOneBattery = {};
    const aggregatorContract = new web3.eth.Contract(Aggregator_json_1.default.abi, aggregatorContractAddress, { from: defaultAccount });
    const tsoContract = new web3.eth.Contract(TSO_json_1.default.abi, tsoContractAddress, { from: tsoAccount });
    app.use(express_1.default.json());
    // API per registrare una batteria
    app.post("/registerBattery", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { owner, capacity, SoC } = req.body;
        try {
            if (aggregatorContract && aggregatorContract.methods.registerBattery) {
                if (onlyOneBattery[owner] === 1) {
                    res
                        .status(400)
                        .json({ error: "Battery already registered for this owner." });
                }
                else {
                    const tx = yield aggregatorContract.methods
                        .registerBattery(owner, capacity, SoC)
                        .send({ from: owner });
                    onlyOneBattery[owner] = 1;
                    res.json({
                        message: "Battery registered successfully",
                        txHash: tx.transactionHash,
                    });
                }
            }
            else {
                res.status(500).json({
                    error: "aggregatorContract or registerBattery method is undefined",
                });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }));
    // API per aprire il mercato
    app.post("/openMarket", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { requiredEnergy, isPositiveReserve } = req.body;
        try {
            if (tsoContract && tsoContract.methods.openMarket) {
                const tx = yield tsoContract.methods
                    .openMarket(requiredEnergy, isPositiveReserve)
                    .send({ from: tsoAccount });
                res.json({
                    message: "Market opened successfully",
                    txHash: tx.transactionHash,
                });
            }
            else {
                res.status(500).json({
                    error: "tsoContract or openMarket method is undefined",
                });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }));
    // Avvia il server
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}))();
