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
exports.createContractExecutionEnvironment = exports.loadContract = void 0;
var utils_1 = require("./utils");
var smartweave_global_1 = require("./smartweave-global");
/**
 * Loads the contract source, initial state and other parameters
 *
 * @param arweave     an Arweave client instance
 * @param contractID  the Transaction Id of the contract
 */
function loadContract(arweave, contractID) {
    return __awaiter(this, void 0, void 0, function () {
        var contractTX, contractSrcTXID, minFee, contractSrcTX, contractSrc, state, _a, handler, swGlobal, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, arweave.transactions.get(contractID)];
                case 1:
                    contractTX = _b.sent();
                    contractSrcTXID = utils_1.getTag(contractTX, 'Contract-Src');
                    minFee = utils_1.getTag(contractTX, 'Min-Fee');
                    return [4 /*yield*/, arweave.transactions.get(contractSrcTXID)];
                case 2:
                    contractSrcTX = _b.sent();
                    contractSrc = contractSrcTX.get('data', { decode: true, string: true });
                    state = contractTX.get('data', { decode: true, string: true });
                    _a = createContractExecutionEnvironment(arweave, contractSrc, contractID), handler = _a.handler, swGlobal = _a.swGlobal;
                    return [2 /*return*/, {
                            id: contractID,
                            contractSrc: contractSrc,
                            initState: state,
                            minFee: minFee,
                            contractTX: contractTX,
                            handler: handler,
                            swGlobal: swGlobal
                        }];
                case 3:
                    e_1 = _b.sent();
                    console.error(e_1);
                    throw new Error("Unable to load contract " + contractID + ".");
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.loadContract = loadContract;
/**
 * Translates a contract source code into a Js function that can be called, and sets
 * up two globals, SmartWeave and the ContractError exception.
 *
 * At the moment this uses the Function() constructor (basically the same as eval),
 * But the design is geared toward switching to Realms or something like
 * https://github.com/justjake/quickjs-emscripten. (probably the latter)
 *
 * In the current implemention, using Function(), the 'globals' are actually
 * just lexically scoped vars, unique to each instance of a contract.
 *
 * @param contractSrc the javascript source for the contract. Must declare a handle() function
 */
function createContractExecutionEnvironment(arweave, contractSrc, contractId) {
    // Convert from ES Module format to something we can run inside a Function.
    // just removes the `export` keyword and adds ;return handle to the end of the function.
    // We also assign the passed in SmartWeaveGlobal to SmartWeave, and declare 
    // the ContractError exception. 
    // We then use `new Function()` which we can call and get back the returned handle function
    // which has access to the per-instance globals. 
    contractSrc = contractSrc.replace(/export\s+async\s+function\s+handle/gmu, 'async function handle');
    contractSrc = contractSrc.replace(/export\s+function\s+handle/gmu, 'function handle');
    var ContractErrorDef = "class ContractError extends Error { constructor(message) { super(message); this.name = 'ContractError' } };";
    var ContractAssertDef = "function ContractAssert(cond, message) { if (!cond) throw new ContractError(message) };";
    var returningSrc = "const SmartWeave = swGlobal;\n\n" + ContractErrorDef + "\n" + ContractAssertDef + "\n" + contractSrc + "\n\n;return handle;";
    var swGlobal = new smartweave_global_1.SmartWeaveGlobal(arweave, { id: contractId });
    var getContractFunction = new Function('swGlobal', returningSrc);
    //console.log(returningSrc);
    return {
        handler: getContractFunction(swGlobal),
        swGlobal: swGlobal
    };
}
exports.createContractExecutionEnvironment = createContractExecutionEnvironment;
