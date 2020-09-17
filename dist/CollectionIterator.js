"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Collection Iterator
 */
class CollectionIterator {
    /**
     * Constructor
     */
    constructor(collection, kind = 0) {
        /**
         * Current index of iterator
         *
         * @type number
         */
        this.index = 0;
        /**
         * Type of iterator
         * 0 = values
         * 1 = keys
         * 2 = keys + values
         *
         * @type number
         */
        this.kind = CollectionIterator.ITERATOR_VALUES;
        this.collection = collection;
        this.kind = kind;
        this.index = 0;
    }
    /**
     * Next item
     */
    next() {
        if (this.collection) {
            // Only continue iterating if the iterated collection is long enough.
            if (this.index < this.collection.length) {
                const model = this.collection.at(this.index);
                this.index++;
                // Construct a value depending on what kind of values should be iterated.
                let value;
                // Return model as value
                if (this.kind === CollectionIterator.ITERATOR_VALUES) {
                    value = model;
                }
                else {
                    var id = this.collection.modelId;
                    if (this.kind === CollectionIterator.ITERATOR_KEYS) {
                        value = id;
                    }
                    else {
                        value = [id, model];
                    }
                }
                return {
                    value: value,
                    done: false,
                };
            }
            // Once exhausted, remove the reference to the collection so future
            // calls to the next method always return done.
            this.collection = void 0;
        }
        return {
            value: void 0,
            done: true,
        };
    }
}
exports.default = CollectionIterator;
CollectionIterator.ITERATOR_VALUES = 0;
CollectionIterator.ITERATOR_KEYS = 1;
CollectionIterator.ITERATOR_KEYSVALUES = 2;
//# sourceMappingURL=CollectionIterator.js.map