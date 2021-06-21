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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ActiveRecord_1 = __importDefault(require("./ActiveRecord"));
const CollectionIterator_1 = __importDefault(require("./CollectionIterator"));
const Model_1 = __importDefault(require("./Model"));
class Collection extends ActiveRecord_1.default {
    constructor(options = {}) {
        super(options);
        this.atRelationship = [];
        this.index = 0;
        this.meta = {
            pagination: {
                total: 0,
                count: 15,
                per_page: 15,
                current_page: 1,
                total_pages: 1,
                links: {},
            },
        };
        this.model = Model_1.default;
        this.models = [];
        this.dataKey = 'data';
        this.sortKey = 'id';
        this.builder.qp('limit', this.limit).qp('page', this.page);
        this.setHeader('Content-Type', 'application/json; charset=utf8');
        this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
        if (options.atRelationship) {
            this.atRelationship = options.atRelationship;
        }
    }
    static hydrate(models = [], options = {}) {
        const collection = new this(options);
        collection.add(models);
        collection.options(options);
        return collection;
    }
    get length() {
        return this.models.length;
    }
    get modelId() {
        return 'id';
    }
    get pagination() {
        return this.meta.pagination;
    }
    toJSON() {
        return JSON.parse(JSON.stringify(this.models));
    }
    fetchNext(append = false) {
        return __awaiter(this, void 0, void 0, function* () {
            var options = Object.assign({}, this.lastRequest.options);
            var qp = Object.assign({}, this.builder.queryParams, this.lastRequest.queryParams);
            qp.page = parseFloat(qp.page) + 1;
            options.merge = append;
            return yield this._fetch(options, qp, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
        });
    }
    sync() {
    }
    add(model, options = {}) {
        if (model == undefined) {
            return this;
        }
        const models = Array.isArray(model) ? model : [model];
        models.forEach((model) => {
            if (!(model instanceof Model_1.default)) {
                model = new this.model(model);
                model.parent = this;
                model.headers = this.headers;
                if (this.referenceForModifiedEndpoint) {
                    model.useModifiedEndpoint(this.referenceForModifiedEndpoint);
                }
            }
            if (options.prepend) {
                this.models.unshift(model);
            }
            else {
                this.models.push(model);
            }
        });
        this.dispatch('add');
        return this;
    }
    remove(model, options = {}) {
        let i = 0;
        let ii = 0;
        const items = Array.isArray(model) ? model : [model];
        for (ii = 0; ii < items.length; ii++) {
            i = 0;
            while (i < this.models.length) {
                if (this.models[i] == items[ii]) {
                    this.models.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
        }
        this.dispatch('remove');
        return this;
    }
    set(model, options = {}) {
        if (!options || (options && options.merge != true)) {
            this.reset();
        }
        if (model && model.hasOwnProperty('meta')) {
            this.meta = model.meta;
        }
        if (model && model.hasOwnProperty('data')) {
            this.add(model.data);
        }
        else {
            this.add(model);
        }
        this.dispatch('set');
        return this;
    }
    reset() {
        this.models = [];
        this.dispatch('reset');
        return this;
    }
    clear() {
        return this.reset();
    }
    count() {
        return this.length;
    }
    delete(attributes = null) {
        const url = this.builder.identifier(this.id || (attributes ? attributes.id : '')).url;
        if (this.builder.id) {
            var model = this.findWhere(attributes);
            this.remove(model);
        }
        const body = null;
        const headers = this.headers;
        const method = 'DELETE';
        return this._fetch(null, {}, method, body, headers);
    }
    push(model, options = {}) {
        this.add(model, options);
        return this;
    }
    pop(options = {}) {
        const model = this.at(this.length - 1);
        return this.remove(model, options);
    }
    unshift(model, options = {}) {
        return this.add(model, Object.assign({ prepend: true }, options));
    }
    shift(options = {}) {
        const model = this.at(0);
        return this.remove(model, options);
    }
    slice(...params) {
        return Array.prototype.slice.apply(this.models, params);
    }
    get(query) {
        if (query == null) {
            return void 0;
        }
        return this.where({
            [this.modelId]: query instanceof Model_1.default ? query.cid : query,
        }, true);
    }
    has(obj) {
        return this.get(obj) != undefined;
    }
    at(index = 0) {
        if (index < 0) {
            index += this.length;
        }
        var item = this.models[index];
        if (this.atRelationship && this.atRelationship.length) {
            this.atRelationship.forEach((key) => (item = item[key]));
        }
        return item;
    }
    first() {
        return this.at(0);
    }
    last() {
        return this.at(this.length - 1);
    }
    next() {
        var model = this.at(++this.index);
        return model;
    }
    previous() {
        return this.at(--this.index);
    }
    current() {
        return this.at(this.index);
    }
    where(attributes = {}, first = false) {
        const constructor = this.constructor;
        const collection = new constructor();
        this.models.map((model) => {
            const intersection = Object.keys(model.attributes).filter((k) => k in attributes && model.attr(k) == attributes[k]);
            if (intersection.length) {
                collection.add(model);
            }
        });
        return first ? collection.first() : collection;
    }
    findWhere(attributes = {}) {
        return this.where(attributes, true);
    }
    findByCid(cid) {
        return this.findWhere({ cid });
    }
    each(predicate) {
        this.models.forEach(predicate);
        return this;
    }
    filter(predicate) {
        return this.where(predicate);
    }
    sort(options = null) {
        let key = this.sortKey;
        if (options !== null) {
            key = options.key;
        }
        this.models = this.models.sort((a, b) => {
            return options && options.reverse
                ? (a.attr(key) - b.attr(key)) * -1
                : (a.attr(key) - b.attr(key)) * 1;
        });
        return this;
    }
    pluck(attribute) {
        return this.models.map((model) => model.attr(attribute));
    }
    clone(attributes = {}) {
        const instance = new this.constructor();
        instance.add(this.toJSON());
        return instance;
    }
    values() {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_VALUES);
    }
    keys(attributes = {}) {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_KEYS);
    }
    entries(attributes = {}) {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_KEYSVALUES);
    }
    _isModel(model) {
        return model instanceof Model_1.default;
    }
    [Symbol.iterator]() {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_VALUES);
    }
}
exports.default = Collection;
//# sourceMappingURL=Collection.js.map