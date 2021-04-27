import Builder from "./Http/Builder";
import Core from "./Core";
import Request from "./Http/Request";
import { IAttributes, ICachedResponses, IModelRequestOptions, IModelRequestQueryParams } from "./Interfaces";

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
    public get b(): Builder {
        return this.builder;
    }

    /**
     * Model if we provide a specific identifier
     *
     * @return boolean
     */
    protected get isModel(): boolean {
        return this.builder.identifier !== undefined;
    }

    /**
     * Data set by the request
     *
     * @type object
     */
    // public attributes: Map<string, any> = new Map();
    public attributes: any = new Object();

    /**
     * Base Url for the API
     *
     * @type string
     */
    public baseUrl: string = "/v1";

    /**
     * Body for POST
     *
     * @type object
     */
    public body: any = null;

    /**
     * If this request is allowed to be cached
     *
     * @type {boolean}
     */
    public cacheable: boolean = true;

    /**
     * Local custom key
     *
     * @type {string}
     */
    public cid: string = "";

    /**
     * Endpoint key
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    public endpoint: string = "";

    /**
     * List of headers
     *
     * @type {any}
     */
    public headers: any = {};

    /**
     * Unique key for directly fetching
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    public id: string = "";

    /**
     * Limit
     *
     * @type number
     */
    public limit: number = 15;

    /**
     * If the request is currently loading
     *
     * @type {boolean}
     */
    public loading: boolean = false;

    /**
     * Meta
     *
     * @type object
     */
    public meta: any = {};

    /**
     * Modified endpoint takes precedence
     * @type {string}
     */
    public modifiedEndpoint: string | null = null;

    /**
     * Page
     *
     * @type number
     */
    public page: number = 1;

    /**
     * Last request
     *
     * @type Request
     */
    public request?: Request;

    /**
     * Last Request Time
     */
    public requestTime: number;

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
    protected cidPrefix: string = "c";

    /**
     * The key that collection data exists on, e.g.
     *
     * {
     *     data: [ .. ]
     * }
     *
     * @type string
     */
    protected dataKey: string | undefined = "data";

    /**
     * Save options of last _fetch
     *
     * @type {Object}
     */
    protected lastRequest: any;

    /**
     * Constructor
     */
    constructor(options: any = {}) {
        super(options);

        // Set options on class
        Object.assign(this, options);

        // Setup default last request
        this.lastRequest = {};

        // Setup URL builder
        this.builder = new Builder(this);

        // Options
        this.options(options);

        // Mark creation as the rquest
        this.requestTime = Date.now();
    }

    /**
     * Get attribute
     *
     * @param  string key
     *
     * @return string
     */
    public attr(key: string): string | number | null {
        return this.attributes[key];
    }

    /**
     * Set attributes by hashmap
     *
     * @param object = {} hash
     *
     * @return ActiveRecord
     */
    public set(hash: IAttributes = {}, trigger: boolean = true): any {
        // @ts-ignore
        var possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);

        for (let key in hash) {
            this.attributes[key] = hash[key];

            // Check for setters
            if (possibleSetters && possibleSetters[key] && possibleSetters[key].set) {
                this[key] = hash[key];
            }
        }

        // Check for ID
        if (hash && hash["id"]) {
            this.id = hash.id;
        }

        // Trigger
        if (trigger) {
            this.dispatch("set");
        }

        return this;
    }

    /**
     * Unset attribute
     *
     * Attribute will be `undefined` after unsetting
     *
     * @param  string key
     *
     * @return ActiveRecord
     */
    public unset(key: string): any {
        delete this.attributes[key];

        return this;
    }

    /**
     * Apply an object to change options and set meta
     *
     * @param  {any} options
     * @return {ActiveRecord}
     */
    public options(options: any = {}): any {
        // Override endpoint
        if (options.endpoint) {
            this.setEndpoint(options.endpoint);
        }

        // Check options for headers
        if (options.headers) {
            this.setHeaders(options.headers);
        }

        // Set metadata
        if (options.meta) {
            this.meta = options.meta;
        }

        // Check options for params
        if (options.params || options.qp || options.queryParams) {
            this.setQueryParams(options.queryParams || options.qp || options.params);
        }

        return this;
    }

    /**
     * Converts model to JSON object
     *
     * @return object
     */
    public toJSON(): object {
        let json: any = this.attributes;

        // @todo is this code copasetic?
        // @ts-ignore
        var possibleGetters = Object.getOwnPropertyNames(this.__proto__);

        // Convert toJSON on subobjects so they stay in sync
        for (var key of possibleGetters) {
            // @ts-ignore
            if (json[key] && this[key] && this[key].toJSON) {
                // @ts-ignore
                json[key] = this[key].toJSON();
            }
        }

        return json;
    }

    //#region Actions

    /**
     * Create Model
     *
     * @todo There's a ton to do here too
     */
    public create(attributes: any) {
        return this.post(attributes);
    }

    /**
     * Delete Model
     *
     * @todo There's a ton to do here too
     */
    public delete(attributes: any = null) {
        // Query params
        const url: string = this.builder.identifier(this.id || (attributes ? attributes.id : "")).url;

        // Check for identifier
        if (this.builder.id) {
            var model = this.find(attributes);
            this.remove(model);
        }

        // Attributes
        const body: any = null;
        const headers: any = this.headers;
        const method: string = "DELETE";

        return this._fetch(null, {}, method, body, headers);
    }

    /**
     * POST Model
     */
    public post(attributes: any = null) {
        // Query params
        const url: string = this.builder.url;

        // Attributes
        const body: any = attributes || this.attributes;
        const headers: any = this.headers;
        const method: string = "POST";

        return this._fetch(null, {}, method, body, headers);
    }

    /**
     * PUT model
     *
     * @param  {any = {}} options
     * @param  {any = {}} queryParams
     * @return {any}
     */
    public put(attributes: any): any {
        // Query params
        const url: string = this.builder.url;

        // Attributes
        const body: any = attributes || this.attributes;
        const headers: any = this.headers;
        const method: string = "PUT";

        return this._fetch(null, {}, method, body, headers);
    }

    /**
     * Save model
     *
     * @todo There so much to do to fix this
     *
     * @param  {any = {}} options
     * @param  {any = {}} queryParams
     * @return {any}
     */
    public save(attributes: any = null): any {
        // Query params
        const url: string = this.builder.identifier(this.id || (attributes ? attributes.id : "")).url;

        // Attributes
        const body: any = attributes || this.attributes;
        const headers: any = this.headers;
        const method: string = this.id ? "PUT" : "POST";

        return this._fetch(null, {}, method, body, headers);
    }

    /**
     * Interface for Collection
     */
    public add(x: any) {}

    /**
     * Interface for Collection
     */
    public remove(x: any) {}

    /**
     * Empty attributes
     */
    public reset() {
        this.attributes = {};
    }

    /**
     * Used to get an individual item in a model
     *
     * Can pass either an ID #XX or a slug
     *
     * @param  {string | number} id
     * @return {Promise}
     */
    public async find(
        id: string | number,
        queryParams: IModelRequestQueryParams = {}
    ): Promise<any> { // Promise<void | Request | Response>
        return await this.fetch({ id }, queryParams).then((request) => {
            return this;
        });
    }

    /**
     * Upload file
     *
     * @param  {string} name
     * @param  {any} file
     * @return {any}
     */
    public file(name: string, file: HTMLInputElement | FileList | File): Promise<void | Request | Response> {
        // Query params
        const url: string = this.builder.identifier(this.id).url;

        // const files = event.target.files
        const formData = new FormData();

        // Get file
        if (file instanceof HTMLInputElement) {
            file = (<FileList>file.files)[0];
        } else if (file instanceof FileList) {
            file = file[0];
        } else if (file instanceof File) {
            // Good
        }
        else {
            console.warn("File provided unacceptable type.");
        }

        // Set header
        this.unsetHeader("Content-Type");

        // Add files
        formData.append(name, file);

        // Set fetch
        return this._fetch(null, {}, "POST", formData).then((request: any) => {
            this.dispatch("file:complete", this);

            // @note This was duplicating our images
            // this.add(request.data);

            return request;
        });
    }

    /**
     * Public generic fetch method
     *
     * NOTE: It is favored to use other methods
     *
     * @param  {IModelRequestOptions | null = {}} options
     * @param  {IModelRequestQueryParams = {}} queryParams
     * @return {Promise}
     */
    public async fetch(
        options: IModelRequestOptions | null = {},
        queryParams: IModelRequestQueryParams = {}
    ): Promise<void | Request | Response> {
        return await this._fetch(options, queryParams);
    }

    /**
     * Alias for `file`
     *
     * @param  {string} name
     * @param  {HTMLInputElement | FileList | File} file
     * @return {Promise}
     */
    public upload(name: string, file: HTMLInputElement | FileList | File): Promise<void | Request | Response> {
        return this.file(name, file);
    }

    /**
     * Run last query
     * @return {any}
     */
    public runLast(): any {
        return this._fetch(
            this.lastRequest.options,
            this.lastRequest.queryParams,
            this.lastRequest.method,
            this.lastRequest.body,
            this.lastRequest.headers
        );
    }

    //#endregion Actions

    //#region Set Params

    /**
     * Set specific endpoint override
     *
     * @param  {string} endpoint
     * @return {any}
     */
    public useModifiedEndpoint(activeRecord: ActiveRecord): any {
        // @todo, we shouldn't actually mutate this
        // we should turn the endpoint that we actually use into a getter
        // then have a way of modifying that so we maintain the original class endpoint
        // this.setEndpoint(activeRecord.endpoint + '/' + activeRecord.id + '/' + this.endpoint);

        // Set modified endpoint
        this.modifiedEndpoint = activeRecord.endpoint + "/" + activeRecord.id + "/" + this.endpoint;

        return this;
    }

    /**
     * Set specific boy
     *
     * @param  {string} value
     * @return {any}
     */
    public setBody(value: any): any {
        this.body = value;

        return this;
    }

    /**
     * Set specific endpoint override
     *
     * @param  {string} endpoint
     * @return {any}
     */
    public setEndpoint(endpoint: string): any {
        this.modifiedEndpoint = null;
        this.endpoint = endpoint;

        return this;
    }

    /**
     * Set specific header
     *
     * @param  {string} header
     * @param  {string} value
     * @return {any}
     */
    public setHeader(header: string, value: string | null): any {
        this.headers[header] = value;

        return this;
    }

    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    public setHeaders(headers: any): any {
        for (var k in headers) {
            this.setHeader(k, headers[k]);
        }

        return this;
    }

    /**
     * Override and set id
     *
     * @param  {any} id
     * @return {any}
     */
    public setId(id: any): any {
        this.id = id;

        return this;
    }

    /**
     * Unset id
     *
     * @param  {any} id
     * @return {any}
     */
    public unsetId(): any {
        this.id = "";

        return this;
    }

    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    public unsetHeader(header: string): any {
        this.setHeader(header, null);
        delete this.headers[header];

        return this;
    }

    /**
     * Set specific query param
     *
     * @param  {string} key
     * @param  {string} value
     * @return {any}
     */
    public setQueryParam(key: string, value: string): any {
        this.builder.qp(key, value);

        return this;
    }

    /**
     * Override and set query params
     *
     * @param  {any} params
     * @return {any}
     */
    public setQueryParams(params: any): any {
        for (var k in params) {
            this.setQueryParam(k, params[k]);
        }

        return this;
    }

    /**
     * Override and set query param
     *
     * @param  {any} headers
     * @return {any}
     */
    public unsetQueryParam(param: string): any {
        delete this.builder.queryParams[param];

        return this;
    }

    /**
     * Override and set headers
     *
     * @param  {string} token
     * @return {any}
     */
    public setToken(token: string): any {
        this.setHeader("Authorization", "Bearer " + token);

        return this;
    }

    //#endregion Set Params

    // @todo Update return
    protected _fetch(
        options: IModelRequestOptions | null = {},
        queryParams: IModelRequestQueryParams = {},
        method: any = null,
        body: any = null,
        headers: any = null
    ): Promise<Request> {
        // Save request params
        this.lastRequest = {
            options,
            queryParams,
            method,
            body,
            headers,
        };

        // Set last request time
        this.requestTime = Date.now();

        // Check cacheable
        if (!this.cacheable) {
            this.builder.qp("cb", Date.now());
        }

        // Check for query params
        for (let key in queryParams) {
            this.builder.qp(key, queryParams[key]);
        }

        // Check for ID
        if (options && options.id) {
            this.builder.identifier(options.id);
        }

        // Query params
        const url: string = this.builder.url;

        // Events
        this.dispatch("requesting", this);

        // Set loading
        this.loading = true;

        // Setup request
        var request = (this.request = new Request(url, {
            dataKey: this.dataKey,
        }));

        // After parse
        request.on("parse:after", (e) => {
            method = method || "get";

            // Add model
            if (method.toLowerCase() === "post") {
                this.add(request.data);
            } else if (method.toLowerCase() === "delete") {
                // Intentionally empty
            }
            else {
                this.set(this.dataKey !== undefined ? request.data[this.dataKey] : request.data);
            }

            // Set options
            this.options({
                meta: request.data.meta,
            });

            // Events
            this.dispatch("fetched", this);
        });

        // Bubble `progress` event
        request.on("progress", (e) => {
            this.dispatch("progress", e.data);
        });

        // Bubble `complete` event
        request.on("complete", (e) => {
            // Set loading
            this.loading = false;

            // Bubble
            this.dispatch("complete");
        });

        // Request (method, body headers)
        return request.fetch(method, body || this.body, headers || this.headers);
    }

    //#region Cache

    /**
     * Cached responses by URL
     *
     * Example:
     *
     *     'sotw.com/v1/film..': { complete: false, time: ... }
     */
    protected static cachedResponses: ICachedResponses = {};

    /**
     * Create cached entry
     *
     * Usage:
     *
     *     this.cache('foo', 'bar');
     *
     * @param {string} key
     * @param {any} value
     * @param {boolean} isComplete
     * @param {number} ttl
     *
     * @return void
     */
    protected cache(key: string, value: any, isComplete: boolean = false, ttl: number = 5000): void {
        // If exists, save only value as to not overwrite subscribers
        if (ActiveRecord.cachedResponses[key]) {
            ActiveRecord.cachedResponses[key].complete = isComplete;
            ActiveRecord.cachedResponses[key].time = Date.now();
            ActiveRecord.cachedResponses[key].value = value;
        }
        else {
            ActiveRecord.cachedResponses[key] = {
                complete: false,
                subscribers: [],
                time: Date.now(),
                ttl: ttl,
                value: value,
            };
        }
    }

    /**
     * Check if we have a cached item
     *
     * @param {string} Cache key
     *
     * @return boolean
     */
    protected isCached(key: string): boolean {
        return !!ActiveRecord.cachedResponses[key];
        /*
         * return !!ActiveRecord.cachedResponses[key]
         *     && (ActiveRecord.cachedResponses[key].time + ActiveRecord.cachedResponses[key].ttl) < Date.now();
         */
    }

    /**
     * Says we have a cached item that is currently incomplete
     *
     * @param {string} key
     *
     * @return boolean
     */
    protected isCachePending(key: string): boolean {
        return this.isCached(key) && (!this.getCache(key).complete || this.getCache(key).failed);
    }

    /**
     * Get cached object
     *
     * @param {string} key
     *
     * @return any
     */
    protected getCache(key: string): any {
        return ActiveRecord.cachedResponses[key];
    }

    /**
     * Add subscriber
     *
     * @param {string} key
     * @param {any} resolve
     * @param {any} reject
     * @param {any} collection
     */
    protected addCacheSubscriber(key: string, resolve: any, reject: any, collection: any) {
        const cache: any = this.getCache(key);

        cache.subscribers.push({ collection, reject, resolve });
    }

    /**
     * Clear subscribers
     *
     * @param {string} key
     */
    protected clearCacheSubscribers(key: string) {
        const cache: any = this.getCache(key);
        cache.subscribers = [];
    }

    //#endregion Cache
}
