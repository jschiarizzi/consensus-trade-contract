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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactRead = exports.interactWriteDryRun = exports.interactWrite = void 0;
var contract_load_1 = require("./contract-load");
var contract_read_1 = require("./contract-read");
var contract_step_1 = require("./contract-step");
/**
 * Writes an interaction on the blockchain.
 *
 * This simply creates an interaction tx and posts it.
 * It does not need to know the current state of the contract.
 *
 * @param arweave       an Arweave client instance
 * @param wallet        a wallet private key
 * @param contractId    the Transaction Id of the contract
 * @param input         the interaction input, will be serialized as Json.
 */
function interactWrite(arweave, wallet, contractId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var interactionTx, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, arweave.createTransaction({
                        data: Math.random()
                            .toString()
                            .slice(-4)
                    }, wallet)];
                case 1:
                    interactionTx = _a.sent();
                    if (!input) {
                        throw new Error("Input should be a truthy value: " + JSON.stringify(input));
                    }
                    interactionTx.addTag('App-Name', 'SmartWeaveAction');
                    interactionTx.addTag('App-Version', '0.3.0');
                    interactionTx.addTag('Contract', contractId);
                    interactionTx.addTag('Input', JSON.stringify(input));
                    return [4 /*yield*/, arweave.transactions.sign(interactionTx, wallet)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, arweave.transactions.post(interactionTx)];
                case 3:
                    response = _a.sent();
                    if (response.status != 200)
                        return [2 /*return*/, false];
                    return [2 /*return*/, interactionTx.id];
            }
        });
    });
}
exports.interactWrite = interactWrite;
/**
 * This will load a contract to its latest state, and do a dry run of an interaction,
 * without writing anything to the chain.
 *
 * @param arweave       an Arweave client instance
 * @param wallet        a wallet private or public key
 * @param contractId    the Transaction Id of the contract
 * @param input         the interaction input.
 */
function interactWriteDryRun(arweave, wallet, contractId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var contractInfo, latestState, from, interaction;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, contract_load_1.loadContract(arweave, contractId)];
                case 1:
                    contractInfo = _a.sent();
                    return [4 /*yield*/, contract_read_1.readContract(arweave, contractId)];
                case 2:
                    latestState = _a.sent();
                    return [4 /*yield*/, arweave.wallets.jwkToAddress(wallet)];
                case 3:
                    from = _a.sent();
                    interaction = {
                        input: input,
                        caller: from
                    };
                    return [2 /*return*/, contract_step_1.execute(contractInfo.handler, interaction, latestState)];
            }
        });
    });
}
exports.interactWriteDryRun = interactWriteDryRun;
/**
 * This will load a contract to its latest state, and execute a read interaction that
 * does not change any state.
 *
 * @param arweave       an Arweave client instance
 * @param wallet        a wallet private or public key
 * @param contractId    the Transaction Id of the contract
 * @param input         the interaction input.
 */
function interactRead(arweave, wallet, contractId, input) {
    return __awaiter(this, void 0, void 0, function () {
        var contractInfo, latestState, from, interaction, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, contract_load_1.loadContract(arweave, contractId)];
                case 1:
                    contractInfo = _a.sent();
                    return [4 /*yield*/, contract_read_1.readContract(arweave, contractId)];
                case 2:
                    latestState = _a.sent();
                    return [4 /*yield*/, arweave.wallets.jwkToAddress(wallet)];
                case 3:
                    from = _a.sent();
                    interaction = {
                        input: input,
                        caller: from
                    };
                    return [4 /*yield*/, contract_step_1.execute(contractInfo.handler, interaction, latestState)];
                case 4:
                    result = _a.sent();
                    return [2 /*return*/, result.result];
            }
        });
    });
}
exports.interactRead = interactRead;
