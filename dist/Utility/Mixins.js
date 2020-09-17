"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMixins = void 0;
/**
 * Apply Mixins to Classes
 *
 * @param {any}   derivedCtor [description]
 * @param {any[]} baseCtor    [description]
 */
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
exports.applyMixins = applyMixins;
//# sourceMappingURL=Mixins.js.map