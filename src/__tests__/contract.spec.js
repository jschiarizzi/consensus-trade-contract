"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("typescript.api").register();
var node_1 = __importDefault(require("arweave/node"));
var fs = __importStar(require("fs"));
var contract_load_1 = require("../swglobal/contract-load");
var arweave = node_1.default.init({
    host: 'arweave.net',
    protocol: 'https',
    port: 443
});
var handle = require('../contract.ts').handle;
var state = JSON.parse(fs.readFileSync('./src/contract.json', 'utf8'));
var _a = contract_load_1.createContractExecutionEnvironment(arweave, handle.toString(), 'bYz5YKzHH97983nS8UWtqjrlhBHekyy-kvHt_eBxBBY'), handler = _a.handler, swGlobal = _a.swGlobal;
var addresses = {
    admin: 'uhE-QeYS8i4pmUtnxQyHD7dzXFNaJ9oMK-IM-QPNY6M',
    user: 'VAg65x9jNSfO9KQHdd3tfx1vQa8qyCyJ_uj7QcxNLDk',
    nonuser: 'DiFv0MDBxKEFkJEy_KNgJXNG6mxxSTcxgV0h4gzAgsc'
};
describe('Transfer Balances', function () {
    var func = 'transfer';
    it("should transfer from " + addresses.admin + " to " + addresses.user, function () {
        handler(state, { input: {
                function: func,
                target: addresses.user,
                qty: 1000
            }, caller: addresses.admin });
        expect(Object.keys(state.balances).length).toBe(2);
        expect(state.balances[addresses.admin]).toBe(9999000);
        expect(state.balances[addresses.user]).toBe(1000);
    });
    it('should fail, invalid address', function () {
        try {
            handler(state, { input: {
                    function: func,
                    target: addresses.user,
                    qty: 100
                }, caller: addresses.nonuser });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.balances[addresses.user]).toBe(1000);
        expect(state.balances[addresses.nonuser]).toBeUndefined();
    });
    it('should fail with not enough balance', function () {
        try {
            handler(state, { input: {
                    function: func,
                    target: addresses.nonuser,
                    qty: 1100
                }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.balances[addresses.user]).toBe(1000);
        expect(state.balances[addresses.nonuser]).toBeUndefined();
    });
    it('should fail with same target and caller', function () {
        try {
            handler(state, { input: {
                    function: func,
                    target: addresses.user,
                    qty: 1000
                }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.balances[addresses.user]).toBe(1000);
    });
    it("should transfer from " + addresses.user + " to " + addresses.admin, function () {
        handler(state, { input: {
                function: 'transfer',
                target: addresses.admin,
                qty: 900
            }, caller: addresses.user });
        expect(state.balances[addresses.user]).toBe(100);
        expect(state.balances[addresses.admin]).toBe(9999900);
    });
});
describe('Get account balances', function () {
    var func = 'balance';
    it("should get the balance for " + addresses.admin, function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handler(state, { input: {
                            function: func,
                            target: addresses.admin
                        }, caller: addresses.admin })];
                case 1:
                    res = _a.sent();
                    expect(res.result.target).toBe(addresses.admin);
                    expect(res.result.balance).toBe(10000900);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should get the unlocked balance for " + addresses.admin, function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handler(state, { input: {
                            function: 'unlockedBalance',
                            target: addresses.admin
                        }, caller: addresses[3] })];
                case 1:
                    res = _a.sent();
                    expect(res.result.target).toBe(addresses.admin);
                    expect(res.result.balance).toBe(9999900);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should get the balance for " + addresses.user, function () { return __awaiter(void 0, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, handler(state, { input: {
                            function: func,
                            target: addresses.user
                        }, caller: addresses.admin })];
                case 1:
                    res = _a.sent();
                    expect(res.result.target).toBe(addresses.user);
                    expect(res.result.balance).toBe(100);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should get an error, account doesn't exists.", function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, handler(state, { input: {
                                function: func,
                                target: addresses[3]
                            }, caller: addresses.admin })];
                case 1:
                    res = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    expect(err_1.name).toBe('ContractError');
                    return [3 /*break*/, 3];
                case 3:
                    expect(state.balances[addresses[3]]).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
});
// Had to update SmartWeave to have a custom nonce for these tests.
describe('Locking system', function () {
    var bal = 100;
    var lockLength = 5;
    it('should increase the locked tokens length', function () {
        handler(state, { input: {
                function: 'increaseVault',
                id: 0,
                lockLength: 101
            }, caller: addresses.admin });
        expect(state.vault[addresses.admin][0].end).toBe(101);
        handler(state, { input: {
                function: 'increaseVault',
                id: 0,
                lockLength: 100
            }, caller: addresses.admin });
        expect(state.vault[addresses.admin][0].end).toBe(100);
    });
    it("should not lock " + bal + " from " + addresses.admin, function () {
        try {
            handler(state, { input: {
                    function: 'lock',
                    qty: bal,
                    lockLength: 1,
                }, caller: addresses.admin });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.vault[addresses.admin].length).toBe(1);
    });
    it("should lock " + bal + " from " + addresses.admin, function () {
        var prevBal = state.balances[addresses.admin];
        handler(state, { input: {
                function: 'lock',
                qty: bal,
                lockLength: lockLength
            }, caller: addresses.admin });
        expect(state.vault[addresses.admin].length).toBe(2);
        expect(state.vault[addresses.admin][1]).toEqual({
            balance: bal,
            end: swGlobal.block.height + lockLength,
            start: 0
        });
        expect(state.balances[addresses.admin]).toBe((prevBal - bal));
    });
    it('should not allow unlock', function () {
        handler(state, { input: { function: 'unlock' }, caller: addresses.admin });
        expect(state.vault[addresses.admin].length).toBe(2);
    });
    it('should not allow unlock', function () {
        swGlobal.block.increment();
        try {
            handler(state, { input: { function: 'unlock' }, caller: addresses.admin });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.vault[addresses.admin].length).toBe(2);
    });
    it('should allow unlock', function () {
        var prevBal = state.balances[addresses.admin];
        for (var i = 0; i < 4; i++) {
            swGlobal.block.increment();
        }
        handler(state, { input: { function: 'unlock' }, caller: addresses.admin });
        expect(state.vault[addresses.admin].length).toBe(1);
        expect(state.balances[addresses.admin]).toBe((prevBal + bal));
    });
    it('should allow a lock without giving a target', function () {
        var lockLength = 5;
        var prevBal = state.balances[addresses.admin];
        var bal = 5;
        handler(state, { input: {
                function: 'lock',
                qty: bal,
                lockLength: lockLength
            }, caller: addresses.admin });
        expect(state.vault[addresses.admin].length).toBe(2);
        expect(state.balances[addresses.admin]).toBe(prevBal - bal);
    });
    it('should not allow unlock', function () {
        handler(state, { input: { function: 'unlock' }, caller: addresses.admin });
        expect(state.vault[addresses.admin].length).toBe(2);
    });
    it('should allow 1 unlock', function () {
        for (var i = 0; i < 5; i++) {
            swGlobal.block.increment();
        }
        handler(state, { input: { function: 'unlock' }, caller: addresses.admin });
        expect(state.vault[addresses.admin].length).toBe(1);
    });
    it('should return the account balances', function () { return __awaiter(void 0, void 0, void 0, function () {
        var resultObj, res1, res2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resultObj = {
                        target: addresses.admin,
                        balance: 1000
                    };
                    return [4 /*yield*/, handler(state, { input: { function: 'vaultBalance' }, caller: addresses.admin })];
                case 1:
                    res1 = _a.sent();
                    return [4 /*yield*/, handler(state, { input: { function: 'vaultBalance', target: addresses.user }, caller: addresses.admin })];
                case 2:
                    res2 = _a.sent();
                    expect(res1.result).toEqual({
                        target: addresses.admin,
                        balance: 1000
                    });
                    expect(res2.result).toEqual({
                        target: addresses.user,
                        balance: 0
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
describe('Propose a vote', function () {
    var func = 'propose';
    it('should fail, not locked balance', function () {
        try {
            handler(state, { input: {
                    function: func,
                    type: 'mint',
                    recipient: addresses.user,
                    qty: 100,
                    note: 'Mint 100'
                }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes.length).toBe(0);
    });
    it('should fail, not part of the DAO', function () {
        try {
            handler(state, { input: {
                    function: func,
                    type: 'mint',
                    recipient: addresses.nonuser,
                    qty: 100,
                    note: 'Mint 100'
                }, caller: addresses.nonuser });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes.length).toBe(0);
    });
    it('should fail, invalid vote type DAO', function () {
        try {
            handler(state, { input: {
                    function: func,
                    type: 'invalidFunction',
                    recipient: addresses.user,
                    qty: 100,
                    note: 'Mint 100'
                }, caller: addresses.admin });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes.length).toBe(0);
    });
    it('should create a mint proposal', function () {
        handler(state, { input: {
                function: func,
                type: 'mint',
                recipient: addresses.user,
                qty: 100,
                note: 'Mint 100'
            }, caller: addresses.admin });
        expect(state.votes.length).toBe(1);
    });
    it('should fail to create a mint proposal because of quantity', function () {
        try {
            handler(state, {
                input: {
                    function: func,
                    type: 'mint',
                    recipient: addresses.user,
                    qty: Number.MAX_SAFE_INTEGER + 100,
                    note: 'Mint too much'
                }, caller: addresses.admin
            });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes.length).toBe(1);
    });
    it('should create a mintLocked proposal', function () {
        handler(state, { input: {
                function: func,
                type: 'mintLocked',
                recipient: addresses.user,
                qty: 100,
                note: 'Mint 100'
            }, caller: addresses.admin });
        expect(state.votes.length).toBe(2);
    });
    it('should create a set quorum proposal', function () {
        handler(state, { input: {
                function: func,
                type: 'set',
                key: 'quorum',
                value: 0.3,
                note: 'Mint 100'
            }, caller: addresses.admin });
        expect(state.votes.length).toBe(3);
    });
    it('should create a inidicative proposal', function () {
        handler(state, { input: {
                function: func,
                type: 'indicative',
                note: 'Let\'s do this and that.'
            }, caller: addresses.admin });
        expect(state.votes.length).toBe(4);
    });
    it('should not create a set proposal for balances', function () {
        try {
            handler(state, { input: {
                    function: func,
                    type: 'set',
                    key: 'balances',
                    value: ['random'],
                    note: 'Unable to set proposal balances.'
                }, caller: addresses.admin });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.balances[addresses.admin]).toBeDefined();
    });
    it('should create a set proposal for a role', function () {
        handler(state, { input: {
                function: func,
                type: 'set',
                key: 'role',
                recipient: addresses.admin,
                value: 'MAIN',
                note: 'Set a role MAIN to main addy'
            }, caller: addresses.admin });
        expect(state.votes[(state.votes.length - 1)].value).toEqual('MAIN');
    });
    it('should create a set proposal for a custom field', function () {
        var voteLength = state.votes.length;
        try {
            handler(state, { input: {
                    function: func,
                    type: 'set',
                    key: 'customKey',
                    value: ['custom', 'value'],
                    note: 'This is my custom field note.'
                }, caller: addresses.admin });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes.length).toBe(voteLength + 1);
    });
});
describe('Votes', function () {
    var func = 'vote';
    it('should fail, not enough locked balance', function () {
        try {
            handler(state, { input: {
                    function: func,
                    id: 0,
                    cast: 'yay'
                }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes[0].yays).toBe(0);
        expect(state.votes[1].nays).toBe(0);
    });
    it('should fail, not part of the DAO', function () {
        try {
            handler(state, { input: {
                    function: func,
                    id: 0,
                    cast: 'yay'
                }, caller: addresses.nonuser });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes[0].yays).toBe(0);
        expect(state.votes[1].nays).toBe(0);
    });
    it('should vote yes on proposal', function () {
        handler(state, { input: {
                function: func,
                id: 0,
                cast: 'yay'
            }, caller: addresses.admin });
        expect(state.votes[0].yays).toBe(100000);
        expect(state.votes[0].nays).toBe(0);
    });
    it('should vote no on proposal', function () {
        handler(state, { input: {
                function: func,
                id: 1,
                cast: 'nay'
            }, caller: addresses.admin });
        expect(state.votes[1].yays).toBe(0);
        expect(state.votes[1].nays).toBe(100000);
    });
    it('should fail, already voted', function () {
        try {
            handler(state, { input: {
                    function: func,
                    id: 0,
                    cast: 'yay'
                }, caller: addresses.admin });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes[0].yays).toBe(100000);
        expect(state.votes[0].nays).toBe(0);
    });
    it('should fail, voter locked amount is over', function () {
        handler(state, { input: {
                function: 'lock',
                qty: 50,
                lockLength: 10
            }, caller: addresses.user });
        swGlobal.block.increment(50);
        try {
            handler(state, { input: {
                    function: func,
                    id: 0,
                    cast: 'nay'
                }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes[0].nays).toBe(0);
    });
    it('should fail, locked balance was after proposal creation', function () {
        swGlobal.block.increment();
        handler(state, { input: { function: 'transfer', qty: 100, target: addresses.user }, caller: addresses.admin });
        handler(state, { input: { function: 'lock', qty: 100, lockLength: 10 }, caller: addresses.user });
        try {
            handler(state, { input: { function: func, id: 2, cast: 'yay' }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes[2].yays).toBe(0);
    });
    it('should fail, vote period is over', function () {
        swGlobal.block.increment(2000);
        handler(state, { input: {
                function: 'lock',
                qty: 50,
                lockLength: 10
            }, caller: addresses.user });
        try {
            handler(state, { input: {
                    function: func,
                    id: 0,
                    cast: 'nay'
                }, caller: addresses.user });
        }
        catch (err) {
            expect(err.name).toBe('ContractError');
        }
        expect(state.votes[0].nays).toBe(0);
    });
});
describe('Finalize votes', function () {
    it('should finalize a mint vote', function () {
        handler(state, { input: {
                function: 'finalize',
                id: 0
            }, caller: addresses.admin });
        expect(state.votes[0].status).toBe('passed');
    });
    it('should finalize a mintLocked with status failed', function () {
        handler(state, { input: {
                function: 'finalize',
                id: 1
            }, caller: addresses.admin });
        expect(state.votes[1].status).toBe('failed');
    });
    it('should finalize an indicative with status quorumFailed', function () {
        // Increment to allow the proposal
        swGlobal.block.increment();
        handler(state, { input: { function: 'propose', type: 'indicative', note: 'My note' }, caller: addresses.user });
        handler(state, { input: { function: 'vote', id: (state.votes.length - 1), cast: 'yay' }, caller: addresses.user });
        swGlobal.block.increment(2000);
        handler(state, { input: { function: 'finalize', id: (state.votes.length - 1) }, caller: addresses.user });
        expect(state.votes[(state.votes.length - 1)].status).toBe('quorumFailed');
    });
    it('should finalize and set a role', function () {
        // Manually faking a locked balance.
        state.vault[addresses.admin][0].end = 1000000;
        handler(state, { input: {
                function: 'propose',
                type: 'set',
                key: 'role',
                recipient: addresses.admin,
                value: 'MAIN',
                note: 'role'
            }, caller: addresses.user });
        var lastVoteId = state.votes.length - 1;
        handler(state, { input: { function: 'vote', id: lastVoteId, cast: 'yay' }, caller: addresses.admin });
        swGlobal.block.increment(2000);
        handler(state, { input: { function: 'finalize', id: lastVoteId }, caller: addresses.user });
        expect(state.roles[addresses.admin]).toBe('MAIN');
    });
});
describe('Transfer locked', function () {
    it("should fail with invalid address", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                handler(state, { input: {
                        function: 'transferLocked',
                        target: 'u2ikdjhsoijem',
                        qty: 100,
                        lockLength: 10
                    }, caller: addresses.user });
            }
            catch (err) {
                expect(err.name).toBe('ContractError');
            }
            expect(state.vault['u2ikdjhsoijem']).toBeUndefined();
            return [2 /*return*/];
        });
    }); });
    it("should transfer locked balance", function () { return __awaiter(void 0, void 0, void 0, function () {
        var totalVault;
        return __generator(this, function (_a) {
            totalVault = Object.keys(state.vault[addresses.admin]).length;
            handler(state, { input: {
                    function: 'transferLocked',
                    target: addresses.admin,
                    qty: 100,
                    lockLength: 10
                }, caller: addresses.user });
            expect(Object.keys(state.vault[addresses.admin]).length).toBe((totalVault + 1));
            return [2 /*return*/];
        });
    }); });
});
