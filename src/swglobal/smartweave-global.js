"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWeaveGlobal = void 0;
var utils_1 = require("./utils");
var contract_read_1 = require("./contract-read");
/**
 *
 * This class is be exposed as a global for contracts
 * as 'SmartWeave' and provides an API for getting further
 * information or using utility and crypto functions from
 * inside the contracts execution.
 *
 * It provides an api:
 *
 * - SmartWeave.transaction.id
 * - SmartWeave.transaction.reward
 * - SmartWeave.block.height
 * - etc
 *
 * and access to some of the arweave utils:
 * - SmartWeave.arweave.utils
 * - SmartWeave.arweave.crypto
 * - SmartWeave.arweave.wallets
 * - SmartWeave.arweave.ar
 *
 */
var SmartWeaveGlobal = /** @class */ (function () {
    function SmartWeaveGlobal(arweave, contract) {
        var _this = this;
        this.arweave = {
            ar: arweave.ar,
            utils: arweave.utils,
            wallets: arweave.wallets,
            crypto: arweave.crypto,
        };
        this.contract = contract;
        this.transaction = new Transaction(this);
        this.block = new Block(this);
        this.contracts = {
            readContractState: function (contractId, height) { return contract_read_1.readContract(arweave, contractId, height || (_this._isDryRunning ? Number.POSITIVE_INFINITY : _this.block.height)); }
        };
    }
    Object.defineProperty(SmartWeaveGlobal.prototype, "_isDryRunning", {
        get: function () {
            return !this._activeTx;
        },
        enumerable: false,
        configurable: true
    });
    return SmartWeaveGlobal;
}());
exports.SmartWeaveGlobal = SmartWeaveGlobal;
var Transaction = /** @class */ (function () {
    function Transaction(global) {
        this.global = global;
    }
    Object.defineProperty(Transaction.prototype, "id", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return this.global._activeTx.id;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "owner", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return this.global._activeTx.tx.owner;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "target", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return this.global._activeTx.tx.target;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "tags", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return utils_1.unpackTags(this.global._activeTx.tx);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "quantity", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return this.global._activeTx.tx.quantity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Transaction.prototype, "reward", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return this.global._activeTx.tx.reward;
        },
        enumerable: false,
        configurable: true
    });
    return Transaction;
}());
var Block = /** @class */ (function () {
    function Block(global) {
        this.global = global;
        // Custom nonce to work offline
        this.nonce = 0;
    }
    Object.defineProperty(Block.prototype, "height", {
        get: function () {
            if (!this.global._activeTx) {
                return this.nonce;
            }
            return this.global._activeTx.info.confirmed.block_height;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Block.prototype, "indep_hash", {
        get: function () {
            if (!this.global._activeTx) {
                throw new Error('No current Tx');
            }
            return this.global._activeTx.info.confirmed.block_indep_hash;
        },
        enumerable: false,
        configurable: true
    });
    Block.prototype.increment = function (nonce) {
        if (nonce === void 0) { nonce = 1; }
        this.nonce += nonce;
    };
    return Block;
}());
