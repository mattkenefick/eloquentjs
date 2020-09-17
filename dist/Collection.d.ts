import CollectionIterator from './CollectionIterator';
import ActiveRecord from './ActiveRecord';
import Model from './Model';
import { ICollectionMeta, IPagination, ISortOptions } from './Interfaces';
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
export default class Collection extends ActiveRecord implements Iterable<Model> {
    /**
     * Hydrate a collection full of models
     *
     * @type {Model[]}
     */
    static hydrate<T>(models?: Model[], options?: object): any;
    /**
     * Return count of models
     *
     * @todo Make sure this isn't caching
     *
     * @return number
     */
    get length(): number;
    /**
     * @todo Replace this based on Model
     * @return {string}
     */
    get modelId(): string;
    /**
     * Pagination
     *
     * @return IPagination
     */
    get pagination(): IPagination;
    /**
     * Meta data associated with collection
     *
     * @type {ICollectionMeta}
     */
    meta: ICollectionMeta;
    /**
     * Model object instantiated by this collection
     * This should be replaced by subclass
     *
     * @type {any}
     */
    model: Model;
    /**
     * List of models
     *
     * @type {Model[]}
     */
    models: Model[];
    /**
     * The key that collection data exists on, e.g.
     *
     * {
     *     data: [ .. ]
     * }
     *
     * @type string
     */
    protected dataKey: string | undefined;
    /**
     * Change key we sort on
     *
     * @type {string}
     */
    protected sortKey: string;
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
    constructor(options?: any);
    /**
     * Convert collection to JSON
     *
     * @return {any}
     */
    toJSON(): object;
    /**
     * Sync
     *
     * @todo
     *
     * @return {any}
     */
    sync(): any;
    /**
     * Add or prepend Model(s) to our list
     *
     * @param  {Model[] | Model | object} model
     * @param  {any = {}} options
     * @return Collection
     */
    add(model: Model[] | Model | object, options?: any): Collection;
    /**
     * Remove a model, a set of models, or an object
     *
     * @param  {Model[] | Model | object} model
     * @param  {object = {}} options
     * @return {Collection}
     */
    remove(model: Model[] | Model | object, options?: any): Collection;
    /**
     * Reset and add new models
     *
     * @todo Review this
     *
     * @param  {Model[] | Model | object} model
     * @param  {any = {}} options
     * @return {Collection}
     */
    set(model: Model[] | Model | object, options?: any): Collection;
    /**
     * Reset
     *
     * @todo Might want to do more with this
     * @return {Collection}
     */
    reset(): Collection;
    /**
     * Clear
     *
     * Alias for Reset
     */
    clear(): Collection;
    /**
     * Append Model(s) to end of list
     *
     * @param  {Model[] | Model | object} model
     * @param  {object = {}} options
     * @return {Collection}
     */
    push(model: Model[] | Model | object, options?: object): Collection;
    /**
     * Remove model from end of list
     *
     * @param  {object = {}} options
     * @return Collection
     */
    pop(options?: object): Collection;
    /**
     * Add Model(s) to beginning of list
     *
     * @param  {Model[] | Model | object} model
     * @param  {object = {}} options
     * @return {any}
     */
    unshift(model: Model[] | Model | object, options?: object): Collection;
    /**
     * Remove first object
     *
     * @param  {object = {}} options
     * @return {any}
     */
    shift(options?: object): Collection;
    /**
     * Cut up collection models
     *
     * @return Model[]
     */
    slice(...params: any): Model[];
    /**
     * Get model by ID
     *
     * @param  string | number  id
     * @return Model | undefined
     */
    get(query: Model | string | number): Model | undefined;
    /**
     * Checks if we have an object or Model
     *
     * @param  Model | object  obj
     * @return boolean
     */
    has(obj: Model | string | number): boolean;
    /**
     * Get model at index
     *
     * @param  {number = 0} index
     * @return Model
     */
    at(index?: number): Model;
    /**
     * Get first item
     *
     * @return {Model}
     */
    first(): Model;
    /**
     * Get last item
     *
     * @return {Model}
     */
    last(): Model;
    /**
     * Comparing hard object attributes to model attr
     *
     * @param  {any = {}} attributes
     * @param  {boolean = false} first
     * @return {any}
     */
    where(attributes?: any, first?: boolean): any;
    /**
     * First where
     * @param  {object = {}} attributes
     * @return Model
     */
    findWhere(attributes?: object): Model;
    /**
     * Search by CID
     * @param  {string} cid
     * @return {Model}
     */
    findByCid(cid: string): Model | undefined;
    /**
     * Each
     * @param  {string} cid
     * @return {Model}
     */
    each(predicate: any): any;
    /**
     * Search by CID
     * @param  {string} cid
     * @return {Model}
     */
    filter(predicate: any): any;
    /**
     * Search by CID
     * @param  {string} cid
     * @return {Model}
     */
    find(predicate: any): any;
    /**
     * Sorting models by key or in reverse
     *
     * We have a basic `sortKey` defined on the collection, but
     * can also pass in an object with `key` and `reverse` on it
     *
     * @param  {ISortOptions|null = null} options
     * @return {Collection}
     */
    sort(options?: ISortOptions | null): Collection;
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
    pluck(attribute: string): any;
    /**
     * Clone current object
     *
     * @param {object = {}} attributes
     * @return Collection
     */
    clone(attributes?: object): any;
    /**
     * Return an interator for values based on this collection
     *
     * @return CollectionIterator
     */
    values(): CollectionIterator;
    /**
     * Return an interator for keys based on this collection
     *
     * @return CollectionIterator
     */
    keys(attributes?: object): CollectionIterator;
    /**
     * Return an interator for entries (key + value) based on this collection
     *
     * @return CollectionIterator
     */
    entries(attributes?: object): CollectionIterator;
    /**
     * Determine if an object is infact a model
     *
     * @param  {any} model
     * @return {boolean}
     */
    private _isModel;
    /**
     * Iterator
     */
    [Symbol.iterator](): Iterator<any>;
}
