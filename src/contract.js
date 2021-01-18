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
exports.handle = void 0;
function handle(state, action) {
    var e_1, _a;
    var settings = new Map(state.settings);
    var balances = state.balances;
    var vault = state.vault;
    var votes = state.votes;
    var extensions = state.extensions;
    var input = action.input;
    var caller = action.caller;
    var markets = state.markets;
    /** Transfer Function */
    if (input.function === 'transfer') {
        var target = isArweaveAddress(input.target);
        var qty = input.qty;
        if (!Number.isInteger(qty)) {
            throw new ContractError('Invalid value for "qty". Must be an integer.');
        }
        if (!target) {
            throw new ContractError('No target specified.');
        }
        if (qty <= 0 || caller === target) {
            throw new ContractError('Invalid token transfer.');
        }
        if (!(caller in balances)) {
            throw new ContractError('Caller doesn\'t own any DAO balance.');
        }
        if (balances[caller] < qty) {
            throw new ContractError("Caller balance not high enough to send " + qty + " token(s)!");
        }
        // Lower the token balance of the caller
        balances[caller] -= qty;
        if (target in balances) {
            // Wallet already exists in state, add new tokens
            balances[target] += qty;
        }
        else {
            // Wallet is new, set starting balance
            balances[target] = qty;
        }
        return { state: state };
    }
    if (input.function === 'transferLocked') {
        var target = isArweaveAddress(input.target);
        var qty = +input.qty;
        var lockLength = input.lockLength;
        if (!Number.isInteger(qty) || qty <= 0) {
            throw new ContractError('Quantity must be a positive integer.');
        }
        if (!Number.isInteger(lockLength) || lockLength < settings.get('lockMinLength') || lockLength > settings.get('lockMaxLength')) {
            throw new ContractError("lockLength is out of range. lockLength must be between " + settings.get('lockMinLength') + " - " + settings.get('lockMaxLength') + ".");
        }
        var balance = balances[caller];
        if (isNaN(balance) || balance < qty) {
            throw new ContractError('Not enough balance.');
        }
        balances[caller] -= qty;
        var start = +SmartWeave.block.height;
        var end = start + lockLength;
        if (target in vault) {
            // Wallet already exists in state, add new tokens
            vault[target].push({
                balance: qty,
                end: end,
                start: start
            });
        }
        else {
            // Wallet is new, set starting balance
            vault[target] = [{
                    balance: qty,
                    end: end,
                    start: start
                }];
        }
        return { state: state };
    }
    /** Balance Function */
    if (input.function === 'balance') {
        var target = isArweaveAddress(input.target || caller);
        if (typeof target !== 'string') {
            throw new ContractError('Must specificy target to get balance for.');
        }
        var balance = 0;
        if (target in balances) {
            balance = balances[target];
        }
        if (target in vault && vault[target].length) {
            try {
                balance += vault[target].map(function (a) { return a.balance; }).reduce(function (a, b) { return a + b; }, 0);
            }
            catch (e) { }
        }
        return { result: { target: target, balance: balance } };
    }
    /** Total balance function */
    if (input.function === 'unlockedBalance') {
        var target = isArweaveAddress(input.target || caller);
        if (typeof target !== 'string') {
            throw new ContractError('Must specificy target to get balance for.');
        }
        if (!(target in balances)) {
            throw new ContractError('Cannnot get balance, target does not exist.');
        }
        var balance = balances[target];
        return { result: { target: target, balance: balance } };
    }
    /** Lock System **/
    /** Lock Function */
    if (input.function === 'lock') {
        var qty = input.qty;
        var lockLength = input.lockLength;
        if (!Number.isInteger(qty) || qty <= 0) {
            throw new ContractError('Quantity must be a positive integer.');
        }
        if (!Number.isInteger(lockLength) || lockLength < settings.get('lockMinLength') || lockLength > settings.get('lockMaxLength')) {
            throw new ContractError("lockLength is out of range. lockLength must be between " + settings.get('lockMinLength') + " - " + settings.get('lockMaxLength') + ".");
        }
        var balance = balances[caller];
        if (isNaN(balance) || balance < qty) {
            throw new ContractError('Not enough balance.');
        }
        balances[caller] -= qty;
        var start = +SmartWeave.block.height;
        var end = start + lockLength;
        if (caller in vault) {
            // Wallet already exists in state, add new tokens
            vault[caller].push({
                balance: qty,
                end: end,
                start: start
            });
        }
        else {
            // Wallet is new, set starting balance
            vault[caller] = [{
                    balance: qty,
                    end: end,
                    start: start
                }];
        }
        return { state: state };
    }
    if (input.function === 'increaseVault') {
        var lockLength = input.lockLength;
        var id = input.id;
        if (!Number.isInteger(lockLength) || lockLength < settings.get('lockMinLength') || lockLength > settings.get('lockMaxLength')) {
            throw new ContractError("lockLength is out of range. lockLength must be between " + settings.get('lockMinLength') + " - " + settings.get('lockMaxLength') + ".");
        }
        if (caller in vault) {
            if (!vault[caller][id]) {
                throw new ContractError('Invalid vault ID.');
            }
        }
        else {
            throw new ContractError('Caller does not have a vault.');
        }
        if (+SmartWeave.block.height >= vault[caller][id].end) {
            throw new ContractError('This vault has ended.');
        }
        vault[caller][id].end = (+SmartWeave.block.height + lockLength);
        return { state: state };
    }
    /** Unlock Function */
    if (input.function === 'unlock') {
        // After the time has passed for locked tokens, unlock them calling this function.
        if (caller in vault && vault[caller].length) {
            var i = vault[caller].length;
            while (i--) {
                var locked = vault[caller][i];
                if (+SmartWeave.block.height >= locked.end) {
                    // Unlock
                    if (caller in balances && typeof balances[caller] === 'number') {
                        balances[caller] += locked.balance;
                    }
                    else {
                        balances[caller] = locked.balance;
                    }
                    vault[caller].splice(i, 1);
                }
            }
        }
        return { state: state };
    }
    /** VaultBalance Function */
    if (input.function === 'vaultBalance') {
        var target = isArweaveAddress(input.target || caller);
        var balance = 0;
        if (target in vault) {
            var blockHeight_1 = +SmartWeave.block.height;
            var filtered = vault[target].filter(function (a) { return blockHeight_1 < a.end; });
            for (var i = 0, j = filtered.length; i < j; i++) {
                balance += filtered[i].balance;
            }
        }
        return { result: { target: target, balance: balance } };
    }
    /** Propose Function */
    if (input.function === 'propose') {
        var voteType = input.type;
        var note = input.note;
        if (typeof note !== 'string') {
            throw new ContractError('Note format not recognized.');
        }
        if (!(caller in vault)) {
            throw new ContractError('Caller needs to have locked balances.');
        }
        var hasBalance = (vault[caller] && !!vault[caller].filter(function (a) { return a.balance > 0; }).length);
        if (!hasBalance) {
            throw new ContractError('Caller doesn\'t have any locked balance.');
        }
        var totalWeight = 0;
        var vaultValues = Object.values(vault);
        for (var i = 0, j = vaultValues.length; i < j; i++) {
            var locked = vaultValues[i];
            for (var j_1 = 0, k = locked.length; j_1 < k; j_1++) {
                totalWeight += locked[j_1].balance * (locked[j_1].end - locked[j_1].start);
            }
        }
        var vote = {
            status: 'active',
            type: voteType,
            note: note,
            yays: 0,
            nays: 0,
            voted: [],
            start: +SmartWeave.block.height,
            totalWeight: totalWeight
        };
        if (voteType === 'mint' || voteType === 'mintLocked') {
            var recipient = isArweaveAddress(input.recipient);
            var qty = +input.qty;
            if (!recipient) {
                throw new ContractError('No recipient specified');
            }
            if (!Number.isInteger(qty) || qty <= 0) {
                throw new ContractError('Invalid value for "qty". Must be a positive integer.');
            }
            var totalSupply = 0;
            var vaultValues_1 = Object.values(vault);
            for (var i = 0, j = vaultValues_1.length; i < j; i++) {
                var locked = vaultValues_1[i];
                for (var j_2 = 0, k = locked.length; j_2 < k; j_2++) {
                    totalSupply += locked[j_2].balance;
                }
            }
            var balancesValues = Object.values(balances);
            for (var i = 0, j = balancesValues.length; i < j; i++) {
                totalSupply += balancesValues[i];
            }
            if (totalSupply + qty > Number.MAX_SAFE_INTEGER) {
                throw new ContractError('Quantity too large.');
            }
            var lockLength = {};
            if (input.lockLength) {
                if (!Number.isInteger(input.lockLength) || input.lockLength < settings.get('lockMinLength') || input.lockLength > settings.get('lockMaxLength')) {
                    throw new ContractError("lockLength is out of range. lockLength must be between " + settings.get('lockMinLength') + " - " + settings.get('lockMaxLength') + ".");
                }
                lockLength = { lockLength: input.lockLength };
            }
            Object.assign(vote, {
                recipient: recipient,
                qty: qty,
            }, lockLength);
            votes.push(vote);
        }
        else if (voteType === 'burnVault') {
            var target = isArweaveAddress(input.target);
            if (!target || typeof target !== 'string') {
                throw new ContractError('Target is required.');
            }
            Object.assign(vote, {
                target: target
            });
            votes.push(vote);
        }
        else if (voteType === 'set') {
            if (typeof input.key !== "string") {
                throw new ContractError('Data type of key not supported.');
            }
            // Validators
            if (input.key === 'quorum' || input.key === 'support' || input.key === 'lockMinLength' || input.key === 'lockMaxLength') {
                input.value = +input.value;
            }
            if (input.key === 'quorum') {
                if (isNaN(input.value) || input.value < 0.01 || input.value > 0.99) {
                    throw new ContractError('Quorum must be between 0.01 and 0.99.');
                }
            }
            else if (input.key === 'support') {
                if (isNaN(input.value) || input.value < 0.01 || input.value > 0.99) {
                    throw new ContractError('Support must be between 0.01 and 0.99.');
                }
            }
            else if (input.key === 'lockMinLength') {
                if (!(Number.isInteger(input.value)) || input.value < 1 || input.value >= settings.get('lockMaxLength')) {
                    throw new ContractError('lockMinLength cannot be less than 1 and cannot be equal or greater than lockMaxLength.');
                }
            }
            else if (input.key === 'lockMaxLength') {
                if (!(Number.isInteger(input.value)) || input.value <= settings.get('lockMinLength')) {
                    throw new ContractError('lockMaxLength cannot be less than or equal to lockMinLength.');
                }
            }
            if (input.key === 'role') {
                var recipient = isArweaveAddress(input.recipient);
                if (!recipient) {
                    throw new ContractError('No recipient specified');
                }
                Object.assign(vote, {
                    key: input.key,
                    value: input.value,
                    recipient: recipient
                });
            }
            else {
                Object.assign(vote, {
                    'key': input.key,
                    'value': input.value
                });
            }
            votes.push(vote);
        }
        else if (voteType === 'indicative') {
            votes.push(vote);
        }
        else {
            throw new ContractError('Invalid vote type.');
        }
        return { state: state };
    }
    /** createMarket Function */
    if (input.function == 'createMarket') {
        var voteType = input.type;
        var note = input.note;
        if (typeof note !== 'string') {
            throw new ContractError('Note format not recognized.');
        }
        ;
        var totalWeight = 1.0;
        var vote = {
            status: 'active',
            type: voteType,
            note: note,
            yays: 0,
            nays: 0,
            voted: [],
            start: +SmartWeave.block.height,
            totalWeight: totalWeight
        };
        markets.push(vote);
        return { state: state };
    }
    /** Vote Function */
    if (input.function === 'vote') {
        var id = input.id;
        var cast = input.cast;
        if (!Number.isInteger(id)) {
            throw new ContractError('Invalid value for "id". Must be an integer.');
        }
        var vote = markets[id];
        var voterBalance = 0;
        if (caller in vault) {
            for (var i = 0, j = vault[caller].length; i < j; i++) {
                var locked = vault[caller][i];
                if ((locked.start < vote.start) && locked.end >= vote.start) {
                    voterBalance += locked.balance * (locked.end - locked.start);
                }
            }
        }
        if (voterBalance <= 0) {
            throw new ContractError('Caller does not have locked balances for this vote.');
        }
        if (vote.voted.includes(caller)) {
            throw new ContractError('Caller has already voted.');
        }
        if (+SmartWeave.block.height >= (vote.start + settings.get('voteLength'))) {
            throw new ContractError('Vote has already concluded.');
        }
        if (cast === 'yay') {
            vote.yays += voterBalance;
        }
        else if (cast === 'nay') {
            vote.nays += voterBalance;
        }
        else {
            throw new ContractError('Vote cast type unrecognised.');
        }
        vote.voted.push(caller);
        return { state: state };
    }
    /** Finalize Function */
    if (input.function === 'finalize') {
        var id = input.id;
        var vote = votes[id];
        var qty = vote.qty;
        if (!vote) {
            throw new ContractError('This vote doesn\'t exists.');
        }
        if (+SmartWeave.block.height < (vote.start + settings.get('voteLength'))) {
            throw new ContractError('Vote has not yet concluded.');
        }
        if (vote.status !== 'active') {
            throw new ContractError('Vote is not active.');
        }
        // Check this total supply and quorum.
        if ((vote.totalWeight * settings.get('quorum')) > (vote.yays + vote.nays)) {
            vote.status = 'quorumFailed';
            return { state: state };
        }
        if ((vote.yays !== 0) && (vote.nays === 0 || (vote.yays / vote.nays) > settings.get('support'))) {
            vote.status = 'passed';
            if (vote.type === 'mint' || vote.type === 'mintLocked') {
                var totalSupply = 0;
                var vaultValues = Object.values(vault);
                for (var i = 0, j = vaultValues.length; i < j; i++) {
                    var locked = vaultValues[i];
                    for (var j_3 = 0, k = locked.length; j_3 < k; j_3++) {
                        totalSupply += locked[j_3].balance;
                    }
                }
                var balancesValues = Object.values(balances);
                for (var i = 0, j = balancesValues.length; i < j; i++) {
                    totalSupply += balancesValues[i];
                }
                if (totalSupply + qty > Number.MAX_SAFE_INTEGER) {
                    throw new ContractError('Quantity too large.');
                }
            }
            if (vote.type === 'mint') {
                if (vote.recipient in balances) {
                    // Wallet already exists in state, add new tokens
                    balances[vote.recipient] += qty;
                }
                else {
                    // Wallet is new, set starting balance
                    balances[vote.recipient] = qty;
                }
            }
            else if (vote.type === 'mintLocked') {
                var start = +SmartWeave.block.height;
                var end = start + vote.lockLength;
                var locked = {
                    balance: qty,
                    start: start,
                    end: end
                };
                if (vote.recipient in vault) {
                    // Existing account
                    vault[vote.recipient].push(locked);
                }
                else {
                    // New locked account
                    vault[vote.recipient] = [locked];
                }
            }
            else if (vote.type === 'burnVault') {
                if (vote.target in vault) {
                    delete vault[vote.target];
                }
                else {
                    vote.status = 'failed';
                }
            }
            else if (vote.type === 'set') {
                if (vote.key === 'role') {
                    state.roles[vote.recipient] = vote.value;
                }
                else {
                    settings.set(vote.key, vote.value);
                    state.settings = Array.from(settings);
                }
            }
        }
        else {
            vote.status = 'failed';
        }
        return { state: state };
    }
    /** Roles function */
    if (input.function === 'role') {
        var target = isArweaveAddress(input.target || caller);
        var role = (target in state.roles) ? state.roles[target] : '';
        if (!role.trim().length) {
            throw new ContractError('Target doesn\'t have a role specified.');
        }
        return { result: { target: target, role: role } };
    }
    if (input.function === 'extend') {
        var extension = input.extension;
        extensions.push(extension);
        return { state: state };
    }
    // Sort extensions by ascending order of priority weight, before calling them.
    extensions.sort(function (modA, modB) { return modB.priorityWeight - modA.priorityWeight; });
    try {
        for (var extensions_1 = __values(extensions), extensions_1_1 = extensions_1.next(); !extensions_1_1.done; extensions_1_1 = extensions_1.next()) {
            var extension = extensions_1_1.value;
            state = extension.call({ state: state, action: action });
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (extensions_1_1 && !extensions_1_1.done && (_a = extensions_1.return)) _a.call(extensions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    function isArweaveAddress(addy) {
        var address = addy.toString().trim();
        if (!/[a-z0-9_-]{43}/i.test(address)) {
            throw new ContractError('Invalid Arweave address.');
        }
        return address;
    }
    throw new ContractError("No function supplied or function not recognised: \"" + input.function + "\"");
}
exports.handle = handle;
