export default class CollectionIterator {
    static ITERATOR_VALUES = 0;
    static ITERATOR_KEYS = 1;
    static ITERATOR_KEYSVALUES = 2;
    index = 0;
    collection;
    kind = CollectionIterator.ITERATOR_VALUES;
    constructor(collection, kind = 0) {
        this.collection = collection;
        this.kind = kind;
        this.index = 0;
    }
    next() {
        if (this.collection) {
            if (this.index < this.collection.length) {
                const model = this.collection.at(this.index);
                this.index++;
                let value;
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
            this.collection = void 0;
        }
        return {
            value: void 0,
            done: true,
        };
    }
}
//# sourceMappingURL=CollectionIterator.js.map