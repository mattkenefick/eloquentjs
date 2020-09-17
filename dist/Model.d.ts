import ActiveRecord from './ActiveRecord';
import Request from './Http/Request';
import { IAttributes, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces';
/**
 * [Eloquent description]
 *
 * @type {[type]}
 */
export default class Model extends ActiveRecord {
    /**
     * Hydrate
     *
     * @type {any}
     */
    static hydrate<T>(attributes?: any, options?: object): any;
    /**
     * Hash of attributes whos current + previous value differ
     *
     * @type {object}
     */
    changed: object;
    /**
     * List of fields available
     *
     * @type string[]
     */
    fields: string[];
    /**
     * List of relationships available
     *
     * @type object
     */
    relationships: object;
    /**
     * List of fields available
     *
     * @type string[]
     */
    rules: string[];
    /**
     * Error during validation
     *
     * @type {any}
     */
    validationError: any;
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
     * Instance cache for relationships
     */
    private relationshipCache;
    /**
     * Constructor
     */
    constructor(attributes?: any, options?: any);
    /**
     * Set attributes by hashmap
     *
     * @note Unsure if we should delete existing relationships
     * or `set` on them. I think we have failures with the `set`
     *
     * @param object = {} hash
     *
     * @return ActiveRecord
     */
    set(hash?: IAttributes): any;
    /**
     * Public generic fetch method
     *
     * @param  {IModelRequestOptions | null = {}} options
     * @param  {IModelRequestQueryParams = {}} queryParams
     * @return {Promise}
     */
    fetch(options?: IModelRequestOptions | null, queryParams?: IModelRequestQueryParams): Promise<void | Request | Response>;
    /**
     * Return singular instance of related contnet
     *
     * @param  {string} relationshipName
     * @param  {any} relationshipClass
     * @return {any}
     */
    hasOne(relationshipName: string, relationshipClass: any): any;
    /**
     * Return multiple instances of related content
     *
     * @param  {string} relationshipName
     * @param  {any} relationshipClass
     * @return {any}
     */
    hasMany(relationshipName: string, relationshipClass: any): any;
    /**
     * Validates data
     *
     * @todo Not implemented
     *
     * @return boolean
     */
    private validate;
}
