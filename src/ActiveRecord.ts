import Builder from './Http/Builder';
import Core from './Core';
import Request from './Http/Request';
import {
    IAttributes,
    ICachedResponses,
    IModelRequestOptions,
    IModelRequestQueryParams,
} from './Interfaces';

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
    public attributes: any = {};

    /**
     * Base Url for the API
     *
     * @type string
     */
    public baseUrl: string = '/v1';

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
    public cid: string = '';

    /**
     * Endpoint key
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    public endpoint: string = '';

    /**
     * Optional override for DELETEs
     *
     * https://api.sotw.com/v1/{post_endpoint}
     *
     * @type string | undefined
     */
    public delete_endpoint: string | undefined;

    /**
     * Optional override for POSTs
     *
     * https://api.sotw.com/v1/{post_endpoint}
     *
     * @type string | undefined
     */
    public post_endpoint: string | undefined;

    /**
     * Optional override for PUTs
     *
     * https://api.sotw.com/v1/{post_endpoint}
     *
     * @type string | undefined
     */
    public put_endpoint: string | undefined;

    /**
     * If this has ever fetched
     */
    public hasFetched: boolean = false;

    /**
     * If this has ever fetched and loaded
     */
    public hasLoaded: boolean = false;

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
    public id: string = '';

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
     *
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
     * Parent object
     * Usually when there's a relationship involved
     *
     * @type ActiveRecord
     */
    public parent: any;

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
    protected cidPrefix: string = 'c';

    /**
     * The key that collection data exists on, e.g.
     *
     * {
     *     data: [ .. ]
     * }
     *
     * @type string
     */
    protected dataKey: string | undefined = 'data';

    /**
     * Save options of last _fetch
     *
     * @type {Object}
     */
    protected lastRequest: any;

    /**
     * Prevent overflow of runLastAttempts
     * @type {number}
     */
    protected runLastAttempts: number = 0;

    /**
     * Max attempts to runLast
     * @type {number}
     */
    protected runLastAttemptsMax: number = 2;

    /**
     * Reference to object we use in our modified active record
     *
     * @type ActiveRecord
     */
    protected referenceForModifiedEndpoint: ActiveRecord | null | undefined;

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
            if (
                possibleSetters &&
                possibleSetters[key] &&
                possibleSetters[key].set
            ) {
                this[key] = hash[key];
            }
        }

        // Check for ID
        if (hash && hash['id']) {
            this.id = hash.id;
        }

        // Trigger
        if (trigger) {
            this.dispatch('set');
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
            // Increase count
            // mk: This is kind of wonky...
            if (options.merge) {
                if (
                    options.meta.pagination.count &&
                    this.meta.pagination.count
                ) {
                    options.meta.pagination.count += this.meta.pagination.count;
                }
            }

            // Set
            this.meta = options.meta;
        }

        // Check options for params
        if (options.params || options.qp || options.queryParams) {
            this.setQueryParams(
                options.queryParams || options.qp || options.params
            );
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
    public delete(attributes: any = null): Promise<Request> {
        // Query params
        const url: string = this.builder.identifier(
            this.id || (attributes ? attributes.id : '')
        ).url;

        // const url: string = this.builder.identifier(
        //     this.id || (attributes ? attributes.id : ''),
        // ).url;

        // Attributes
        const body: any = null;
        const headers: any = this.headers;
        const method: string = 'DELETE';

        return this._fetch(null, {}, method, body, headers);
    }

    /**
     * POST Model
     */
    public post(attributes: any = null): Promise<Request> {
        // Query params
        const url: string = this.builder.url;

        // Attributes
        const body: any = attributes || this.attributes;
        const headers: any = this.headers;
        const method: string = 'POST';

        return this._fetch(null, {}, method, body, headers);
    }

    /**
     * PUT model
     *
     * @param  {any = {}} options
     * @param  {any = {}} queryParams
     * @return {any}
     */
    public put(attributes: any): Promise<Request> {
        // Query params
        const url: string = this.builder.url;

        // Attributes
        const body: any = attributes || this.attributes;
        const headers: any = this.headers;
        const method: string = 'PUT';

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
    public save(attributes: any = null): Promise<Request> {
        // Query params
        // const url: string = this.builder.identifier(this.id || (attributes ? attributes.id : "")).url;

        // Attributes
        const body: any = attributes || this.attributes;
        const headers: any = this.headers;
        const method: string = this.id ? 'PUT' : 'POST';

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
    ): Promise<any> {
        // Promise<void | Request | Response>
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
    public file(
        name: string,
        file: HTMLInputElement | FileList | File
    ): Promise<void | Request | Response> {
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
        } else {
            console.warn('File provided unacceptable type.');
        }

        // Set header
        this.unsetHeader('Content-Type');

        // Add files
        formData.append(name, file);

        // Set fetch
        return this._fetch(null, {}, 'POST', formData).then((request: any) => {
            this.dispatch('file:complete', this);

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
    public upload(
        name: string,
        file: HTMLInputElement | FileList | File
    ): Promise<void | Request | Response> {
        return this.file(name, file);
    }

    /**
     * Run last query
     * @return {any}
     */
    public runLast(): any {
        // Check if we can do this
        if (++this.runLastAttempts >= this.runLastAttemptsMax) {
            console.warn('Run last attempts expired');

            setTimeout(() => {
                this.runLastAttempts = 0;
            }, 1000);
            return;
        }

        return this._fetch(
            this.lastRequest.options,
            this.lastRequest.queryParams,
            this.lastRequest.method,
            this.lastRequest.body,
            this.lastRequest.headers
        );
    }

    //#endregion Actions

    //#region Get Params

    public getUrlByMethod(method: string): string {
        // Setup URL
        let url: string = '';
        let originalEndpoint: string = this.endpoint;

        // Use a modified endpoint, if one exists
        if (method === 'delete' && this.delete_endpoint) {
            originalEndpoint = this.endpoint;
            this.endpoint = this.delete_endpoint;
        } else if (method === 'put' && this.put_endpoint) {
            originalEndpoint = this.endpoint;
            this.endpoint = this.put_endpoint;
        } else if (method === 'post' && this.post_endpoint) {
            originalEndpoint = this.endpoint;
            this.endpoint = this.post_endpoint;
        }

        // Check if we're using modified
        if (this.referenceForModifiedEndpoint && this.modifiedEndpoint) {
            this.useModifiedEndpoint(this.referenceForModifiedEndpoint);
        }

        // Mark url
        url = this.builder.url;

        // Reset endpoint
        this.endpoint = originalEndpoint;

        // Query params
        return url;
    }

    //#endregion Get Params

    //#region Set Params

    /**
     * We automatically assign modified endpoints through relationships
     * like hasOne/hasMany, but sometimes we may not want to change that
     * endpoint. This allows us to cancel the change.
     *
     * @return {any}
     */
    public cancelModifiedEndpoint(): any {
        this.referenceForModifiedEndpoint = undefined;
        this.modifiedEndpoint = null;

        return this;
    }

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

        // Object we reference for modified
        this.referenceForModifiedEndpoint = activeRecord;

        // Warnings
        if (activeRecord.id == null) {
            console.warn(
                'Modified endpoints usually have an ID signature. Are you sure this is right?'
            );
        }

        // Set modified endpoint
        this.modifiedEndpoint =
            activeRecord.endpoint +
            '/' +
            activeRecord.id +
            (activeRecord.id ? '/' : '') +
            this.endpoint;

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
        this.referenceForModifiedEndpoint = undefined;
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
        this.id = '';

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
        this.setHeader('Authorization', 'Bearer ' + token);

        return this;
    }

    /**
     * Function to call after setting a fetch
     *
     * This is useful if we're doing callbacks from cached promises
     */
    public setAfterResponse(request: Request, options: any = {}) {
        var method: string = request.method || 'get';

        // Add model
        if (method.toLowerCase() === 'post') {
            this.add(request.data);
        } else if (method.toLowerCase() === 'delete') {
            // Intentionally empty
        } else {
            var data =
                this.dataKey !== undefined
                    ? request.data[this.dataKey]
                    : request.data;

            this.set(data, options);
        }

        // Set options
        this.options(
            Object.assign({}, options, {
                meta: request.data.meta,
            })
        );

        // Events
        this.dispatch('parse:after', this);
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
        // Promise<void | Request | Response>
        // Normalize method
        method = method ? method.toLowerCase() : 'get';

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
            this.builder.qp('cb', Date.now());
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
        const url: string = this.getUrlByMethod(method);

        // Events
        this.dispatch('requesting', this);

        // Has fetched
        this.hasFetched = true;

        // Set loading
        this.loading = true;

        // Setup request
        var request = (this.request = new Request(url, {
            dataKey: this.dataKey,
        }));

        // note: this *should* be set by fetch as well, but
        // we have an issue right now we're working out
        this.request.method = method;

        // After parse
        request.on('parse:after', (e) => {
            method = method || 'get';

            // Add model
            if (method.toLowerCase() === 'post') {
                this.add(request.data);
            } else if (method.toLowerCase() === 'delete') {
                // Intentionally empty
            } else {
                this.set(
                    this.dataKey !== undefined
                        ? request.data[this.dataKey]
                        : request.data
                );
            }

            // Events
            this.dispatch('fetched', this);
        });

        // Bubble `progress` event
        request.on('progress', (e) => {
            this.dispatch('progress', e.data);
        });

        // Bubble `complete` event
        request.on('complete', (e) => {
            // Set loading
            this.loading = false;

            // Bubble
            this.dispatch('complete');
        });

        // After parse
        request.on('parse:after', (e) =>
            this.FetchParseAfter(request, e, options)
        );
        request.on('progress', (e) => this.FetchProgress(request, e, options));
        request.on('complete', (e) => this.FetchComplete(request, e, options));
        request.on('complete:get', (e) => this.dispatch('complete:get'));
        request.on('complete:put', (e) => this.dispatch('complete:put'));
        request.on('complete:post', (e) => this.dispatch('complete:post'));
        request.on('complete:delete', (e) => this.dispatch('complete:delete'));

        // Request (method, body headers)
        return request.fetch(
            method,
            body || this.body,
            headers || this.headers
        );
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
    protected cache(
        key: string,
        value: any,
        isComplete: boolean = false,
        ttl: number = 5000
    ): void {
        // If exists, save only value as to not overwrite subscribers
        if (ActiveRecord.cachedResponses[key]) {
            ActiveRecord.cachedResponses[key].complete = isComplete;
            ActiveRecord.cachedResponses[key].time = Date.now();
            ActiveRecord.cachedResponses[key].value = value;
        } else {
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
        return (
            this.isCached(key) &&
            (!this.getCache(key).complete || this.getCache(key).failed)
        );
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
    protected addCacheSubscriber(
        key: string,
        resolve: any,
        reject: any,
        collection: any
    ) {
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

    /*
     * Complete from fetch request
     *
     * @param {Request} request
     * @param {any} e
     */
    protected FetchComplete(request: Request, e: any, options: any = {}) {
        var method: string = request.method || 'get';

        // Has loaded ever
        this.hasLoaded = true;

        // Set loading
        this.loading = false;

        // Bubble
        this.dispatch('complete', request.data);
    }

    /**
     * Progress from fetch request
     *
     * @param {Request} request
     * @param {any} e
     */
    protected FetchProgress(request: Request, e: any, options: any = {}) {
        this.dispatch('progress', e.data);
    }

    /**
     * Overrideable fetch parse:after
     *
     * @param {string = 'get'} method
     * @param {Request} request
     */
    protected FetchParseAfter(request: Request, e: any, options: any = {}) {
        const response: Response = <Response>request.response;
        const code: number = <number>response.status;

        // Only set for acceptable responses
        if (code < 400) {
            this.setAfterResponse(request, options);
        }

        // Fetched event
        this.dispatch('fetched', this);
    }
}
