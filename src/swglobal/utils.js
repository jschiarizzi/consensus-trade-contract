"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToHex = exports.unpackTags = exports.getTag = void 0;
function getTag(tx, name) {
    var tags = tx.get('tags');
    for (var i = 0; i < tags.length; i++) {
        // decoding tags can throw on invalid utf8 data.
        try {
            if (tags[i].get('name', { decode: true, string: true }) == name)
                return tags[i].get('value', { decode: true, string: true });
        }
        catch (e) {
        }
    }
    return false;
}
exports.getTag = getTag;
/**
 * Unpacks string tags from a Tx and puts in a KV map
 * Tags that appear multiple times will be converted to an
 * array of string values, ordered as they appear in the tx.
 *
 * @param tx
 */
function unpackTags(tx) {
    var tags = tx.get('tags');
    var result = {};
    for (var i = 0; i < tags.length; i++) {
        try {
            var name = tags[i].get('name', { decode: true, string: true });
            var value = tags[i].get('value', { decode: true, string: true });
            if (!result.hasOwnProperty(name)) {
                result[name] = value;
                continue;
            }
            result[name] = __spread(result[name], [value]);
        }
        catch (e) {
            // ignore tags with invalid utf-8 strings in key or value.
        }
    }
    return result;
}
exports.unpackTags = unpackTags;
function arrayToHex(arr) {
    var str = '';
    for (var i = 0; i < arr.length; i++) {
        str += ("0" + arr[i].toString(16)).slice(-2);
    }
    return str;
}
exports.arrayToHex = arrayToHex;
