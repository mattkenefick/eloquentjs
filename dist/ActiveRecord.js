"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Builder_1 = __importDefault(require("./Http/Builder"));
const Core_1 = __importDefault(require("./Core"));
const Request_1 = __importDefault(require("./Http/Request"));
/**
 * ActiveRecord
 *
 * @type {[type]}
 */
class ActiveRecord extends Core_1.default {
    /**
     * Constructor
     */
    constructor(options = {}) {
        super(options);
        /**
         * Data set by the request
         *
         * @type object
         */
        // public attributes: Map<string, any> = new Map();
        this.attributes = new Object();
        /**
         * Base Url for the API
         *
         * @type string
         */
        this.baseUrl = '/v1';
        /**
         * Body for POST
         *
         * @type object
         */
        this.body = null;
        /**
         * If this request is allowed to be cached
         *
         * @type {boolean}
         */
        this.cacheable = true;
        /**
         * Local custom key
         *
         * @type {string}
         */
        this.cid = '';
        /**
         * Endpoint key
         *
         * https://api.sotw.com/v1/{endpoint}
         *
         * @type string
         */
        this.endpoint = '';
        /**
         * List of headers
         *
         * @type {any}
         */
        this.headers = {};
        /**
         * Unique key for directly fetching
         *
         * https://api.sotw.com/v1/{endpoint}
         *
         * @type string
         */
        this.id = '';
        /**
         * Limit
         *
         * @type number
         */
        this.limit = 15;
        /**
         * If the request is currently loading
         *
         * @type {boolean}
         */
        this.loading = false;
        /**
         * Meta
         *
         * @type object
         */
        this.meta = {};
        /**
         * Modified endpoint takes precedence
         * @type {string}
         */
        this.modifiedEndpoint = null;
        /**
         * Page
         *
         * @type number
         */
        this.page = 1;
        /**
         * Used for identifying local models
         *
         * @type {string}
         */
        this.cidPrefix = 'c';
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
        // Set options on class
        Object.assign(this, options);
        // Setup default last request
        this.lastRequest = {};
        // Setup URL builder
        this.builder = new Builder_1.default(this);
        // Options
        this.options(options);
        // Mark creation as the rquest
        this.requestTime = Date.now();
    }
    /**
     * Get builder reference
     *
     * @return Builder
     */
    get b() {
        return this.builder;
    }
    /**
     * Model if we provide a specific identifier
     *
     * @return boolean
     */
    get isModel() {
        return this.builder.identifier !== undefined;
    }
    /**
     * Get attribute
     *
     * @param  string key
     *
     * @return string
     */
    attr(key) {
        return this.attributes[key];
    }
    /**
     * Set attributes by hashmap
     *
     * @param object = {} hash
     *
     * @return ActiveRecord
     */
    set(hash = {}, trigger = true) {
        // @ts-ignore
        var possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);
        for (let key in hash) {
            this.attributes[key] = hash[key];
            // Check for setters
            if (possibleSetters && possibleSetters[key] && possibleSetters[key].set) {
                // @ts-ignore
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
    unset(key) {
        delete this.attributes[key];
        return this;
    }
    /**
     * Apply an object to change options and set meta
     *
     * @param  {any} options
     * @return {ActiveRecord}
     */
    options(options = {}) {
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
    toJSON() {
        let json = this.attributes;
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
    // region Actions
    /**
     * Create Model
     *
     * @todo There's a ton to do here too
     */
    create(attributes) {
        return this.post(attributes);
    }
    /**
     * Delete Model
     *
     * @todo There's a ton to do here too
     */
    delete(attributes = null) {
        // Query params
        const url = this.builder
            .identifier(this.id || (attributes ? attributes.id : ''))
            .url;
        // Check for identifier
        if (this.builder.id) {
            var model = this.find(attributes);
            this.remove(model);
        }
        // Attributes
        const body = null;
        const headers = this.headers;
        const method = 'DELETE';
        return this._fetch(null, {}, method, body, headers);
    }
    /**
     * POST Model
     */
    post(attributes = null) {
        // Query params
        const url = this.builder.url;
        // Attributes
        const body = attributes || this.attributes;
        const headers = this.headers;
        const method = 'POST';
        return this._fetch(null, {}, method, body, headers);
    }
    /**
     * PUT model
     *
     * @param  {any = {}} options
     * @param  {any = {}} queryParams
     * @return {any}
     */
    put(attributes) {
        // Query params
        const url = this.builder.url;
        // Attributes
        const body = attributes || this.attributes;
        const headers = this.headers;
        const method = 'PUT';
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
    save(attributes = null) {
        // Query params
        const url = this.builder
            .identifier(this.id || (attributes ? attributes.id : ''))
            .url;
        // Attributes
        const body = attributes || this.attributes;
        const headers = this.headers;
        const method = this.id ? 'PUT' : 'POST';
        return this._fetch(null, {}, method, body, headers);
    }
    /**
     * Interface for Collection
     */
    add(x) { }
    /**
     * Interface for Collection
     */
    remove(x) { }
    /**
     * Empty attributes
     */
    reset() {
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
    async find(id, queryParams = {}) {
        return await this.fetch({ id }, queryParams)
            .then(request => {
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
    file(name, file) {
        // Query params
        const url = this.builder
            .identifier(this.id)
            .url;
        // const files = event.target.files
        const formData = new FormData();
        // Get file
        if (file instanceof HTMLInputElement) {
            file = file.files[0];
        }
        else if (file instanceof FileList) {
            file = file[0];
        }
        else if (file instanceof File) {
            // Good
        }
        else {
            console.warn('File provided unacceptable type.');
        }
        // Set header
        this.unsetHeader('Content-Type');
        // Add files
        formData.append(name, file);
        // Set fetch
        return this._fetch(null, {}, 'POST', formData)
            .then((request) => {
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
    async fetch(options = {}, queryParams = {}) {
        return await this._fetch(options, queryParams);
    }
    /**
     * Alias for `file`
     *
     * @param  {string} name
     * @param  {HTMLInputElement | FileList | File} file
     * @return {Promise}
     */
    upload(name, file) {
        return this.file(name, file);
    }
    /**
     * Run last query
     * @return {any}
     */
    runLast() {
        return this._fetch(this.lastRequest.options, this.lastRequest.queryParams, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
    }
    // endregion Actions
    // region Set Params
    /**
     * Set specific endpoint override
     *
     * @param  {string} endpoint
     * @return {any}
     */
    useModifiedEndpoint(activeRecord) {
        // @todo, we shouldn't actually mutate this
        // we should turn the endpoint that we actually use into a getter
        // then have a way of modifying that so we maintain the original class endpoint
        // this.setEndpoint(activeRecord.endpoint + '/' + activeRecord.id + '/' + this.endpoint);
        // Set modified endpoint
        this.modifiedEndpoint = activeRecord.endpoint + '/' + activeRecord.id + '/' + this.endpoint;
        return this;
    }
    /**
     * Set specific boy
     *
     * @param  {string} value
     * @return {any}
     */
    setBody(value) {
        this.body = value;
        return this;
    }
    /**
     * Set specific endpoint override
     *
     * @param  {string} endpoint
     * @return {any}
     */
    setEndpoint(endpoint) {
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
    setHeader(header, value) {
        this.headers[header] = value;
        return this;
    }
    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    setHeaders(headers) {
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
    setId(id) {
        this.id = id;
        return this;
    }
    /**
     * Unset id
     *
     * @param  {any} id
     * @return {any}
     */
    unsetId() {
        this.id = '';
        return this;
    }
    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    unsetHeader(header) {
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
    setQueryParam(key, value) {
        this.builder.qp(key, value);
        return this;
    }
    /**
     * Override and set query params
     *
     * @param  {any} params
     * @return {any}
     */
    setQueryParams(params) {
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
    unsetQueryParam(param) {
        delete this.builder.queryParams[param];
        return this;
    }
    /**
     * Override and set headers
     *
     * @param  {string} token
     * @return {any}
     */
    setToken(token) {
        this.setHeader('Authorization', 'Bearer ' + token);
        return this;
    }
    // endregion Set Params
    // @todo Update return
    _fetch(options = {}, queryParams = {}, method = null, body = null, headers = null) {
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
        const url = this.builder.url;
        // Events
        this.dispatch('requesting', this);
        // Set loading
        this.loading = true;
        // Setup request
        var request = this.request = new Request_1.default(url, {
            dataKey: this.dataKey,
        });
        // After parse
        request.on('parse:after', e => {
            method = method || 'get';
            // Add model
            if (method.toLowerCase() === 'post') {
                this.add(request.data);
            }
            else if (method.toLowerCase() === 'delete') {
                // Intentionally empty
            }
            else {
                this.set(this.dataKey !== undefined
                    ? request.data[this.dataKey]
                    : request.data);
            }
            // Set options
            this.options({
                meta: request.data.meta,
            });
            // Events
            this.dispatch('fetched', this);
        });
        // Bubble `progress` event
        request.on('progress', e => {
            this.dispatch('progress', e.data);
        });
        // Bubble `complete` event
        request.on('complete', e => {
            // Set loading
            this.loading = false;
            // Bubble
            this.dispatch('complete');
        });
        // Request (method, body headers)
        return request.fetch(method, body || this.body, headers || this.headers);
    }
}
exports.default = ActiveRecord;
//# sourceMappingURL=ActiveRecord.js.map