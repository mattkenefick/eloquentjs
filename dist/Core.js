"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const dispatcher_1 = require("dispatcher");
/**
 * Core
 *
 * Base level class related to core functionality of models, collections,
 * utlities, etc
 */
class Core extends dispatcher_1.Dispatcher {
    /**
     * [constructor description]
     * @param {object = {}} options
     */
    constructor(options = {}) {
        super();
        // Set options on class
        Object.assign(this, options);
    }
    trigger(eventName, data) {
        return super.trigger(eventName, data);
    }
    dispatch(eventName, data) {
        return super.dispatch(eventName, data);
    }
    on(eventName, callback) {
        return super.on(eventName, callback);
    }
    off(eventName, callback) {
        return super.off(eventName, callback);
    }
}
exports.default = Core;
//# sourceMappingURL=Core.js.map