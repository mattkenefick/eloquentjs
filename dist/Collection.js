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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CollectionIterator_1 = __importDefault(require("./CollectionIterator"));
const ActiveRecord_1 = __importDefault(require("./ActiveRecord"));
const Model_1 = __importDefault(require("./Model"));
// Try `npm install @types/lodash` if it exists or add a new declaration (.d.ts) file containing `declare module 'lodash';`
// @ts-ignore
const _ = __importStar(require("lodash"));
/**
 * [Collection description]
 *
 * "meta": {
 *     "pagination": {
 *         "total": 1938,
 *         "count": 15,
 *         "per_page": 15,
 *         "current_page": 1,
 *         "total_pages": 130,
 *         "links": {
 *             "next": "http://api.sotw.com/v1/film?page=2"
 *         }
 *     }
 * }
 *
 */
class Collection extends ActiveRecord_1.default {
    /**
     * Constructor
     *
     * We specifically don't set models here because the Model doesn't exist
     * until constructor is done. We must use hydrate for that. Don't add data.
     *
     * If we do it early, we won't get FilmModels, we'll get Models.
     *
     * @param {object = {}} options
     */
    constructor(options = {}) {
        super(options);
        /**
         * Meta data associated with collection
         *
         * @type {ICollectionMeta}
         */
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
        /**
         * Model object instantiated by this collection
         * This should be replaced by subclass
         *
         * @type {any}
         */
        // @ts-ignore Because webpack attempts to autoload this
        this.model = Model_1.default;
        /**
         * List of models
         *
         * @type {Model[]}
         */
        this.models = [];
        /**
         * The key that collection data exists on, e.g.
         *
         * {
         *     data: [ .. ]
         * }
         *
         * @type string
         */
        this.dataKey = 'data';
        /**
         * Change key we sort on
         *
         * @type {string}
         */
        this.sortKey = 'id';
        // Set default content type header
        this.setHeader('Content-Type', 'application/json; charset=utf8');
        // Set defaults
        this.cid = this.cidPrefix + Math.random()
            .toString(36)
            .substr(2, 5);
    }
    /**
     * Hydrate a collection full of models
     *
     * @type {Model[]}
     */
    static hydrate(models = [], options = {}) {
        // Instantiate collection
        const collection = new this(options);
        // Add models to collection
        collection.add(models);
        // Add options to collection
        collection.options(options);
        return collection;
    }
    /**
     * Return count of models
     *
     * @todo Make sure this isn't caching
     *
     * @return number
     */
    get length() {
        return this.models.length;
    }
    /**
     * @todo Replace this based on Model
     * @return {string}
     */
    get modelId() {
        return 'id';
    }
    /**
     * Pagination
     *
     * @return IPagination
     */
    get pagination() {
        return this.meta.pagination;
    }
    /**
     * Convert collection to JSON
     *
     * @return {any}
     */
    toJSON() {
        return JSON.parse(JSON.stringify(this.models));
    }
    /**
     * Sync
     *
     * @todo
     *
     * @return {any}
     */
    sync() {
        // Not implemented
        // call parent
    }
    /**
     * Add or prepend Model(s) to our list
     *
     * @param  {Model[] | Model | object} model
     * @param  {any = {}} options
     * @return Collection
     */
    add(model, options = {}) {
        if (model == undefined) {
            return this;
        }
        const models = Array.isArray(model)
            ? model
            : [model];
        // Iterate through models
        models.forEach((model) => {
            // Data supplied is an object that must be instantiated
            if (!(model instanceof Model_1.default)) {
                // @ts-ignore
                model = new this.model(model);
            }
            if (options.prepend) {
                this.models.unshift(model);
            }
            else {
                this.models.push(model);
            }
        });
        // Event for add
        this.dispatch('add');
        return this;
    }
    /**
     * Remove a model, a set of models, or an object
     *
     * @param  {Model[] | Model | object} model
     * @param  {object = {}} options
     * @return {Collection}
     */
    remove(model, options = {}) {
        let i = 0;
        let ii = 0;
        const items = Array.isArray(model)
            ? model
            : [model];
        // Take the first model in our list and iterate through our local
        // models. If we are successful, call recursive
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
        // Event for add
        this.dispatch('remove');
        return this;
    }
    /**
     * Reset and add new models
     *
     * @todo Review this
     *
     * @param  {Model[] | Model | object} model
     * @param  {any = {}} options
     * @return {Collection}
     */
    set(model, options = {}) {
        this.reset();
        // Check for `meta` on set, this sometimes happens
        // if we assign an entire bootstrapped JSON object
        // to the collection
        if (model && model.hasOwnProperty('meta')) {
            // @ts-ignore
            this.meta = model.meta;
        }
        // Check for `meta` on set, this sometimes happens
        // if we assign an entire bootstrapped JSON object
        // to the collection
        if (model && model.hasOwnProperty('data')) {
            // @ts-ignore
            this.add(model.data);
        }
        else {
            // @ts-ignore
            this.add(model);
        }
        // Event for add
        this.dispatch('set');
        return this;
    }
    /**
     * Reset
     *
     * @todo Might want to do more with this
     * @return {Collection}
     */
    reset() {
        this.models = [];
        // Event for add
        this.dispatch('reset');
        return this;
    }
    /**
     * Clear
     *
     * Alias for Reset
     */
    clear() {
        return this.reset();
    }
    /**
     * Append Model(s) to end of list
     *
     * @param  {Model[] | Model | object} model
     * @param  {object = {}} options
     * @return {Collection}
     */
    push(model, options = {}) {
        this.add(model, options);
        return this;
    }
    /**
     * Remove model from end of list
     *
     * @param  {object = {}} options
     * @return Collection
     */
    pop(options = {}) {
        const model = this.at(this.length - 1);
        return this.remove(model, options);
    }
    /**
     * Add Model(s) to beginning of list
     *
     * @param  {Model[] | Model | object} model
     * @param  {object = {}} options
     * @return {any}
     */
    unshift(model, options = {}) {
        return this.add(model, Object.assign({ prepend: true }, options));
    }
    /**
     * Remove first object
     *
     * @param  {object = {}} options
     * @return {any}
     */
    shift(options = {}) {
        const model = this.at(0);
        return this.remove(model, options);
    }
    /**
     * Cut up collection models
     *
     * @return Model[]
     */
    slice(...params) {
        return Array.prototype.slice.apply(this.models, params);
    }
    /**
     * Get model by ID
     *
     * @param  string | number  id
     * @return Model | undefined
     */
    get(query) {
        if (query == null) {
            return void 0;
        }
        return this.where({
            [this.modelId]: query instanceof Model_1.default
                ? query.cid
                : query,
        }, true);
    }
    /**
     * Checks if we have an object or Model
     *
     * @param  Model | object  obj
     * @return boolean
     */
    has(obj) {
        return this.get(obj) != undefined;
    }
    /**
     * Get model at index
     *
     * @param  {number = 0} index
     * @return Model
     */
    at(index = 0) {
        if (index < 0) {
            index += this.length;
        }
        return this.models[index];
    }
    /**
     * Get first item
     *
     * @return {Model}
     */
    first() {
        return this.at(0);
    }
    /**
     * Get last item
     *
     * @return {Model}
     */
    last() {
        return this.at(this.length - 1);
    }
    /**
     * Comparing hard object attributes to model attr
     *
     * @param  {any = {}} attributes
     * @param  {boolean = false} first
     * @return {any}
     */
    where(attributes = {}, first = false) {
        // @ts-ignore
        const collection = new this.constructor();
        // @todo, this code sucks but I'm not spending all day here
        _.map(this.models, (model) => {
            if (_.find(model, attributes)) {
                collection.add(model);
            }
        });
        return first
            ? collection.first()
            : collection;
    }
    /**
     * First where
     * @param  {object = {}} attributes
     * @return Model
     */
    findWhere(attributes = {}) {
        return this.where(attributes, true);
    }
    /**
     * Search by CID
     * @param  {string} cid
     * @return {Model}
     */
    findByCid(cid) {
        return _.find(this.models, { cid });
    }
    /**
     * Each
     * @param  {string} cid
     * @return {Model}
     */
    each(predicate) {
        return _.each(this.models, predicate);
    }
    /**
     * Search by CID
     * @param  {string} cid
     * @return {Model}
     */
    filter(predicate) {
        return _.filter(this.models, predicate);
    }
    /**
     * Search by CID
     * @param  {string} cid
     * @return {Model}
     */
    find(predicate) {
        return _.find(this.models, predicate);
    }
    /**
     * Sorting models by key or in reverse
     *
     * We have a basic `sortKey` defined on the collection, but
     * can also pass in an object with `key` and `reverse` on it
     *
     * @param  {ISortOptions|null = null} options
     * @return {Collection}
     */
    sort(options = null) {
        let key = this.sortKey;
        // Sort options
        if (options !== null) {
            key = options.key;
        }
        // Sort
        this.models = this.models.sort((a, b) => {
            return options && options.reverse
                ? (a.attr(key) - b.attr(key)) * -1
                : (a.attr(key) - b.attr(key)) * 1;
        });
        return this;
    }
    /**
     * Pull out an attribute from our models
     *
     * Example:
     *     collection.pluck('name');
     *
     *     ['Ashley', 'Briana', 'Chloe', ...]
     *
     * @param  {string} attribute
     * @return {any}
     */
    pluck(attribute) {
        return this.models.map(model => model.attr(attribute));
    }
    /**
     * Clone current object
     *
     * @param {object = {}} attributes
     * @return Collection
     */
    clone(attributes = {}) {
        // @ts-ignore
        const instance = new this.constructor();
        instance.add(this.toJSON());
        return instance;
    }
    /**
     * Return an interator for values based on this collection
     *
     * @return CollectionIterator
     */
    values() {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_VALUES);
    }
    /**
     * Return an interator for keys based on this collection
     *
     * @return CollectionIterator
     */
    keys(attributes = {}) {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_KEYS);
    }
    /**
     * Return an interator for entries (key + value) based on this collection
     *
     * @return CollectionIterator
     */
    entries(attributes = {}) {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_KEYSVALUES);
    }
    /**
     * Determine if an object is infact a model
     *
     * @param  {any} model
     * @return {boolean}
     */
    _isModel(model) {
        return model instanceof Model_1.default;
    }
    /**
     * Iterator
     */
    [Symbol.iterator]() {
        return new CollectionIterator_1.default(this, CollectionIterator_1.default.ITERATOR_VALUES);
    }
}
exports.default = Collection;
//# sourceMappingURL=Collection.js.map