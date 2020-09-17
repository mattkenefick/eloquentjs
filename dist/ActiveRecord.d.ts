import Builder from './Http/Builder';
import Core from './Core';
import Request from './Http/Request';
import { IAttributes, IModelRequestOptions, IModelRequestQueryParams } from './Interfaces';
/**
 * ActiveRecord
 *
 * @type {[type]}
 */
export default class ActiveRecord extends Core {
    /**
     * Get builder reference
     *
     * @return Builder
     */
    get b(): Builder;
    /**
     * Model if we provide a specific identifier
     *
     * @return boolean
     */
    protected get isModel(): boolean;
    /**
     * Data set by the request
     *
     * @type object
     */
    attributes: any;
    /**
     * Base Url for the API
     *
     * @type string
     */
    baseUrl: string;
    /**
     * Body for POST
     *
     * @type object
     */
    body: any;
    /**
     * If this request is allowed to be cached
     *
     * @type {boolean}
     */
    cacheable: boolean;
    /**
     * Local custom key
     *
     * @type {string}
     */
    cid: string;
    /**
     * Endpoint key
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    endpoint: string;
    /**
     * List of headers
     *
     * @type {any}
     */
    headers: any;
    /**
     * Unique key for directly fetching
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    id: string;
    /**
     * Limit
     *
     * @type number
     */
    limit: number;
    /**
     * If the request is currently loading
     *
     * @type {boolean}
     */
    loading: boolean;
    /**
     * Meta
     *
     * @type object
     */
    meta: any;
    /**
     * Modified endpoint takes precedence
     * @type {string}
     */
    modifiedEndpoint: string | null;
    /**
     * Page
     *
     * @type number
     */
    page: number;
    /**
     * Last request
     *
     * @type Request
     */
    request?: Request;
    /**
     * Last Request Time
     */
    requestTime: number;
    /**
     * API Query Builder
     *
     * @type Builder
     */
    protected builder: Builder;
    /**
     * Used for identifying local models
     *
     * @type {string}
     */
    protected cidPrefix: string;
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
     * Save options of last _fetch
     *
     * @type {Object}
     */
    protected lastRequest: any;
    /**
     * Constructor
     */
    constructor(options?: any);
    /**
     * Get attribute
     *
     * @param  string key
     *
     * @return string
     */
    attr(key: string): string | number | null;
    /**
     * Set attributes by hashmap
     *
     * @param object = {} hash
     *
     * @return ActiveRecord
     */
    set(hash?: IAttributes, trigger?: boolean): any;
    /**
     * Unset attribute
     *
     * Attribute will be `undefined` after unsetting
     *
     * @param  string key
     *
     * @return ActiveRecord
     */
    unset(key: string): any;
    /**
     * Apply an object to change options and set meta
     *
     * @param  {any} options
     * @return {ActiveRecord}
     */
    options(options?: any): any;
    /**
     * Converts model to JSON object
     *
     * @return object
     */
    toJSON(): object;
    /**
     * Create Model
     *
     * @todo There's a ton to do here too
     */
    create(attributes: any): any;
    /**
     * Delete Model
     *
     * @todo There's a ton to do here too
     */
    delete(attributes?: any): any;
    /**
     * POST Model
     */
    post(attributes?: any): any;
    /**
     * PUT model
     *
     * @param  {any = {}} options
     * @param  {any = {}} queryParams
     * @return {any}
     */
    put(attributes: any): any;
    /**
     * Save model
     *
     * @todo There so much to do to fix this
     *
     * @param  {any = {}} options
     * @param  {any = {}} queryParams
     * @return {any}
     */
    save(attributes?: any): any;
    /**
     * Interface for Collection
     */
    add(x: any): void;
    /**
     * Interface for Collection
     */
    remove(x: any): void;
    /**
     * Empty attributes
     */
    reset(): void;
    /**
     * Used to get an individual item in a model
     *
     * Can pass either an ID #XX or a slug
     *
     * @param  {string | number} id
     * @return {Promise}
     */
    find(id: string | number, queryParams?: IModelRequestQueryParams): Promise<any>;
    /**
     * Upload file
     *
     * @param  {string} name
     * @param  {any} file
     * @return {any}
     */
    file(name: string, file: HTMLInputElement | FileList | File): Promise<void | Request | Response>;
    /**
     * Public generic fetch method
     *
     * NOTE: It is favored to use other methods
     *
     * @param  {IModelRequestOptions | null = {}} options
     * @param  {IModelRequestQueryParams = {}} queryParams
     * @return {Promise}
     */
    fetch(options?: IModelRequestOptions | null, queryParams?: IModelRequestQueryParams): Promise<void | Request | Response>;
    /**
     * Alias for `file`
     *
     * @param  {string} name
     * @param  {HTMLInputElement | FileList | File} file
     * @return {Promise}
     */
    upload(name: string, file: HTMLInputElement | FileList | File): Promise<void | Request | Response>;
    /**
     * Run last query
     * @return {any}
     */
    runLast(): any;
    /**
     * Set specific endpoint override
     *
     * @param  {string} endpoint
     * @return {any}
     */
    useModifiedEndpoint(activeRecord: ActiveRecord): any;
    /**
     * Set specific boy
     *
     * @param  {string} value
     * @return {any}
     */
    setBody(value: any): any;
    /**
     * Set specific endpoint override
     *
     * @param  {string} endpoint
     * @return {any}
     */
    setEndpoint(endpoint: string): any;
    /**
     * Set specific header
     *
     * @param  {string} header
     * @param  {string} value
     * @return {any}
     */
    setHeader(header: string, value: string | null): any;
    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    setHeaders(headers: any): any;
    /**
     * Override and set id
     *
     * @param  {any} id
     * @return {any}
     */
    setId(id: any): any;
    /**
     * Unset id
     *
     * @param  {any} id
     * @return {any}
     */
    unsetId(): any;
    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    unsetHeader(header: string): any;
    /**
     * Set specific query param
     *
     * @param  {string} key
     * @param  {string} value
     * @return {any}
     */
    setQueryParam(key: string, value: string): any;
    /**
     * Override and set query params
     *
     * @param  {any} params
     * @return {any}
     */
    setQueryParams(params: any): any;
    /**
     * Override and set query param
     *
     * @param  {any} headers
     * @return {any}
     */
    unsetQueryParam(param: string): any;
    /**
     * Override and set headers
     *
     * @param  {string} token
     * @return {any}
     */
    setToken(token: string): any;
    protected _fetch(options?: IModelRequestOptions | null, queryParams?: IModelRequestQueryParams, method?: any, body?: any, headers?: any): any;
}
