"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectWeightedPstHolder = void 0;
/**
 * Given an map of address->balance, select one random address
 * weighted by the amount of tokens they hold.
 *
 * @param balances  A balances object, where the key is address and the value is the number of tokens they hold
 */
function selectWeightedPstHolder(balances) {
    var e_1, _a, e_2, _b, e_3, _c;
    // Count the total tokens
    var totalTokens = 0;
    try {
        for (var _d = __values(Object.keys(balances)), _e = _d.next(); !_e.done; _e = _d.next()) {
            var address = _e.value;
            totalTokens += balances[address];
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
    // Create a copy of balances where the amount each holder owns is represented
    // by a value 0-1.
    var weighted = {};
    try {
        for (var _f = __values(Object.keys(balances)), _g = _f.next(); !_g.done; _g = _f.next()) {
            var address = _g.value;
            weighted[address] = balances[address] / totalTokens;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var sum = 0;
    var r = Math.random();
    try {
        for (var _h = __values(Object.keys(weighted)), _j = _h.next(); !_j.done; _j = _h.next()) {
            var address = _j.value;
            sum += weighted[address];
            if (r <= sum && weighted[address] > 0) {
                return address;
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
        }
        finally { if (e_3) throw e_3.error; }
    }
    throw new Error("Unable to select token holder");
}
exports.selectWeightedPstHolder = selectWeightedPstHolder;
