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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readContract = void 0;
var contract_load_1 = require("./contract-load");
var promises_tho_1 = require("promises-tho");
var utils_1 = require("./utils");
var contract_step_1 = require("./contract-step");
/**
 * Queries all interaction transactions and replays a contract to its latest state.
 *
 * If height is provided, will replay only to that block height.
 *
 * @param arweave     an Arweave client instance
 * @param contractId  the Transaction Id of the contract
 * @param height      if specified the contract will be replayed only to this block height
 */
function readContract(arweave, contractId, height) {
    if (height === void 0) { height = Number.POSITIVE_INFINITY; }
    return __awaiter(this, void 0, void 0, function () {
        var contractInfo, state, arql, transactions, getTxInfoFn, batcher, unconfirmed, txInfos, handler, swGlobal, i, input, interaction, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, contract_load_1.loadContract(arweave, contractId)];
                case 1:
                    contractInfo = _a.sent();
                    try {
                        state = JSON.parse(contractInfo.initState);
                    }
                    catch (e) {
                        throw new Error("Unable to parse initial state for contract: " + contractId);
                    }
                    arql = {
                        op: 'and',
                        expr1: {
                            op: 'equals',
                            expr1: 'App-Name',
                            expr2: 'SmartWeaveAction',
                        },
                        expr2: {
                            op: 'equals',
                            expr1: 'Contract',
                            expr2: contractId
                        }
                    };
                    return [4 /*yield*/, arweave.arql(arql)];
                case 2:
                    transactions = _a.sent();
                    getTxInfoFn = promises_tho_1.retryWithBackoff({ tries: 3, startMs: 1000 }, function (id) { return getFullTxInfo(arweave, id); });
                    batcher = promises_tho_1.batch({ batchDelayMs: 50, batchSize: 3 }, promises_tho_1.softFailWith(undefined, getTxInfoFn));
                    console.log("Query returned " + transactions.length + " interactions");
                    return [4 /*yield*/, batcher(transactions)];
                case 3:
                    unconfirmed = _a.sent();
                    console.log("Recieved info for " + unconfirmed.length + " transactions");
                    txInfos = unconfirmed
                        .filter(function (x) {
                        return x &&
                            x.info.confirmed &&
                            x.info.confirmed.block_height <= height;
                    });
                    console.log("Replaying " + txInfos.length + " confirmed interactions");
                    txInfos.sort(function (a, b) { return a.sortKey.localeCompare(b.sortKey); });
                    handler = contractInfo.handler, swGlobal = contractInfo.swGlobal;
                    i = 0;
                    _a.label = 4;
                case 4:
                    if (!(i < txInfos.length)) return [3 /*break*/, 7];
                    input = void 0;
                    try {
                        input = utils_1.getTag(txInfos[i].tx, 'Input');
                        input = JSON.parse(input);
                    }
                    catch (e) { }
                    if (!input) {
                        console.warn("Skipping tx with missing or invalid Input tag - " + txInfos[i].id);
                        return [3 /*break*/, 6];
                    }
                    interaction = {
                        input: input,
                        caller: txInfos[i].from,
                    };
                    swGlobal._activeTx = txInfos[i];
                    return [4 /*yield*/, contract_step_1.execute(handler, interaction, state)];
                case 5:
                    result = _a.sent();
                    if (result.type === 'exception') {
                        console.warn("" + result.result);
                        console.warn("Executing of interaction: " + txInfos[i].id + " threw exception.");
                    }
                    if (result.type === 'error') {
                        console.warn("" + result.result);
                        console.warn("Executing of interaction: " + txInfos[i].id + " returned error.");
                    }
                    state = result.state;
                    _a.label = 6;
                case 6:
                    i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, state];
            }
        });
    });
}
exports.readContract = readContract;
// This gets the full Tx Info, and calcutes a sort key.
// It needs to get the block_height and indep_hash from
// the status endpoint as well as the tx itself. Returns 
// undefined if the transactions is not confirmed. 
function getFullTxInfo(arweave, id) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, tx, info, blockHashBytes, txIdBytes, concatted, hashed, _b, block_height, sortKey;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        arweave.transactions.get(id).catch(function (e) {
                            if (e.type === 'TX_PENDING') {
                                return undefined;
                            }
                            throw (e);
                        }),
                        arweave.transactions.getStatus(id)
                    ])];
                case 1:
                    _a = __read.apply(void 0, [_d.sent(), 2]), tx = _a[0], info = _a[1];
                    if (!tx || !info || !info.confirmed) {
                        return [2 /*return*/, undefined];
                    }
                    blockHashBytes = arweave.utils.b64UrlToBuffer(info.confirmed.block_indep_hash);
                    txIdBytes = arweave.utils.b64UrlToBuffer(id);
                    concatted = arweave.utils.concatBuffers([blockHashBytes, txIdBytes]);
                    _b = utils_1.arrayToHex;
                    return [4 /*yield*/, arweave.crypto.hash(concatted)];
                case 2:
                    hashed = _b.apply(void 0, [_d.sent()]);
                    block_height = ("000000" + info.confirmed.block_height).slice(-12);
                    sortKey = block_height + "," + hashed;
                    _c = { tx: tx, info: info, id: tx.id, sortKey: sortKey };
                    return [4 /*yield*/, arweave.wallets.ownerToAddress(tx.owner)];
                case 3: return [2 /*return*/, (_c.from = _d.sent(), _c)];
            }
        });
    });
}
