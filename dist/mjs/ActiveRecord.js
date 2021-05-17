import Builder from './Http/Builder';
import Core from './Core';
import Request from './Http/Request';
export default class ActiveRecord extends Core {
    get b() {
        return this.builder;
    }
    get isModel() {
        return this.builder.identifier !== undefined;
    }
    attributes = new Object();
    baseUrl = '/v1';
    body = null;
    cacheable = true;
    cid = '';
    endpoint = '';
    delete_endpoint;
    post_endpoint;
    put_endpoint;
    hasFetched = false;
    hasLoaded = false;
    headers = {};
    id = '';
    limit = 15;
    loading = false;
    meta = {};
    modifiedEndpoint = null;
    page = 1;
    parent;
    request;
    requestTime;
    builder;
    cidPrefix = 'c';
    dataKey = 'data';
    lastRequest;
    runLastAttempts = 0;
    runLastAttemptsMax = 2;
    referenceForModifiedEndpoint;
    constructor(options = {}) {
        super(options);
        Object.assign(this, options);
        this.lastRequest = {};
        this.builder = new Builder(this);
        this.options(options);
        this.requestTime = Date.now();
    }
    attr(key) {
        return this.attributes[key];
    }
    set(hash = {}, trigger = true) {
        var possibleSetters = Object.getOwnPropertyDescriptors(this.__proto__);
        for (let key in hash) {
            this.attributes[key] = hash[key];
            if (possibleSetters &&
                possibleSetters[key] &&
                possibleSetters[key].set) {
                this[key] = hash[key];
            }
        }
        if (hash && hash['id']) {
            this.id = hash.id;
        }
        if (trigger) {
            this.dispatch('set');
        }
        return this;
    }
    unset(key) {
        delete this.attributes[key];
        return this;
    }
    options(options = {}) {
        if (options.endpoint) {
            this.setEndpoint(options.endpoint);
        }
        if (options.headers) {
            this.setHeaders(options.headers);
        }
        if (options.meta) {
            if (options.merge) {
                if (options.meta.pagination.count &&
                    this.meta.pagination.count) {
                    options.meta.pagination.count += this.meta.pagination.count;
                }
            }
            this.meta = options.meta;
        }
        if (options.params || options.qp || options.queryParams) {
            this.setQueryParams(options.queryParams || options.qp || options.params);
        }
        return this;
    }
    toJSON() {
        let json = this.attributes;
        var possibleGetters = Object.getOwnPropertyNames(this.__proto__);
        for (var key of possibleGetters) {
            if (json[key] && this[key] && this[key].toJSON) {
                json[key] = this[key].toJSON();
            }
        }
        return json;
    }
    create(attributes) {
        return this.post(attributes);
    }
    delete(attributes = null) {
        const url = this.builder.identifier(this.id || (attributes ? attributes.id : '')).url;
        if (this.builder.id) {
            var model = this.find(attributes);
            this.remove(model);
        }
        const body = null;
        const headers = this.headers;
        const method = 'DELETE';
        return this._fetch(null, {}, method, body, headers);
    }
    post(attributes = null) {
        const url = this.builder.url;
        const body = attributes || this.attributes;
        const headers = this.headers;
        const method = 'POST';
        return this._fetch(null, {}, method, body, headers);
    }
    put(attributes) {
        const url = this.builder.url;
        const body = attributes || this.attributes;
        const headers = this.headers;
        const method = 'PUT';
        return this._fetch(null, {}, method, body, headers);
    }
    save(attributes = null) {
        const body = attributes || this.attributes;
        const headers = this.headers;
        const method = this.id ? 'PUT' : 'POST';
        return this._fetch(null, {}, method, body, headers);
    }
    add(x) { }
    remove(x) { }
    reset() {
        this.attributes = {};
    }
    async find(id, queryParams = {}) {
        return await this.fetch({ id }, queryParams).then((request) => {
            return this;
        });
    }
    file(name, file) {
        const url = this.builder.identifier(this.id).url;
        const formData = new FormData();
        if (file instanceof HTMLInputElement) {
            file = file.files[0];
        }
        else if (file instanceof FileList) {
            file = file[0];
        }
        else if (file instanceof File) {
        }
        else {
            console.warn('File provided unacceptable type.');
        }
        this.unsetHeader('Content-Type');
        formData.append(name, file);
        return this._fetch(null, {}, 'POST', formData).then((request) => {
            this.dispatch('file:complete', this);
            return request;
        });
    }
    async fetch(options = {}, queryParams = {}) {
        return await this._fetch(options, queryParams);
    }
    upload(name, file) {
        return this.file(name, file);
    }
    runLast() {
        if (++this.runLastAttempts >= this.runLastAttemptsMax) {
            console.warn('Run last attempts expired');
            setTimeout(() => {
                this.runLastAttempts = 0;
            }, 1000);
            return;
        }
        return this._fetch(this.lastRequest.options, this.lastRequest.queryParams, this.lastRequest.method, this.lastRequest.body, this.lastRequest.headers);
    }
    getUrlByMethod(method) {
        let url = '';
        let originalEndpoint = this.endpoint;
        if (method === 'delete' && this.delete_endpoint) {
            originalEndpoint = this.endpoint;
            this.endpoint = this.delete_endpoint;
        }
        else if (method === 'put' && this.put_endpoint) {
            originalEndpoint = this.endpoint;
            this.endpoint = this.put_endpoint;
        }
        else if (method === 'post' && this.post_endpoint) {
            originalEndpoint = this.endpoint;
            this.endpoint = this.post_endpoint;
        }
        if (this.referenceForModifiedEndpoint && this.modifiedEndpoint) {
            this.useModifiedEndpoint(this.referenceForModifiedEndpoint);
        }
        url = this.builder.url;
        this.endpoint = originalEndpoint;
        return url;
    }
    cancelModifiedEndpoint() {
        this.referenceForModifiedEndpoint = undefined;
        this.modifiedEndpoint = null;
        return this;
    }
    useModifiedEndpoint(activeRecord) {
        this.referenceForModifiedEndpoint = activeRecord;
        if (activeRecord.id == null) {
            console.warn('Modified endpoints usually have an ID signature. Are you sure this is right?');
        }
        this.modifiedEndpoint =
            activeRecord.endpoint +
                '/' +
                activeRecord.id +
                (activeRecord.id ? '/' : '') +
                this.endpoint;
        return this;
    }
    setBody(value) {
        this.body = value;
        return this;
    }
    setEndpoint(endpoint) {
        this.referenceForModifiedEndpoint = undefined;
        this.modifiedEndpoint = null;
        this.endpoint = endpoint;
        return this;
    }
    setHeader(header, value) {
        this.headers[header] = value;
        return this;
    }
    setHeaders(headers) {
        for (var k in headers) {
            this.setHeader(k, headers[k]);
        }
        return this;
    }
    setId(id) {
        this.id = id;
        return this;
    }
    unsetId() {
        this.id = '';
        return this;
    }
    unsetHeader(header) {
        this.setHeader(header, null);
        delete this.headers[header];
        return this;
    }
    setQueryParam(key, value) {
        this.builder.qp(key, value);
        return this;
    }
    setQueryParams(params) {
        for (var k in params) {
            this.setQueryParam(k, params[k]);
        }
        return this;
    }
    unsetQueryParam(param) {
        delete this.builder.queryParams[param];
        return this;
    }
    setToken(token) {
        this.setHeader('Authorization', 'Bearer ' + token);
        return this;
    }
    setAfterResponse(request, options = {}) {
        var method = request.method || 'get';
        if (method.toLowerCase() === 'post') {
            this.add(request.data);
        }
        else if (method.toLowerCase() === 'delete') {
        }
        else {
            var data = this.dataKey !== undefined
                ? request.data[this.dataKey]
                : request.data;
            this.set(data, options);
        }
        this.options(Object.assign({}, options, {
            meta: request.data.meta,
        }));
        this.dispatch('parse:after', this);
    }
    _fetch(options = {}, queryParams = {}, method = null, body = null, headers = null) {
        method = method ? method.toLowerCase() : 'get';
        this.lastRequest = {
            options,
            queryParams,
            method,
            body,
            headers,
        };
        this.requestTime = Date.now();
        if (!this.cacheable) {
            this.builder.qp('cb', Date.now());
        }
        for (let key in queryParams) {
            this.builder.qp(key, queryParams[key]);
        }
        if (options && options.id) {
            this.builder.identifier(options.id);
        }
        const url = this.getUrlByMethod(method);
        this.dispatch('requesting', this);
        this.hasFetched = true;
        this.loading = true;
        var request = (this.request = new Request(url, {
            dataKey: this.dataKey,
        }));
        this.request.method = method;
        request.on('parse:after', (e) => {
            method = method || 'get';
            if (method.toLowerCase() === 'post') {
                this.add(request.data);
            }
            else if (method.toLowerCase() === 'delete') {
            }
            else {
                this.set(this.dataKey !== undefined
                    ? request.data[this.dataKey]
                    : request.data);
            }
            this.dispatch('fetched', this);
        });
        request.on('progress', (e) => {
            this.dispatch('progress', e.data);
        });
        request.on('complete', (e) => {
            this.loading = false;
            this.dispatch('complete');
        });
        request.on('parse:after', (e) => this.FetchParseAfter(request, e, options));
        request.on('progress', (e) => this.FetchProgress(request, e, options));
        request.on('complete', (e) => this.FetchComplete(request, e, options));
        request.on('complete:get', (e) => this.dispatch('complete:get'));
        request.on('complete:put', (e) => this.dispatch('complete:put'));
        request.on('complete:post', (e) => this.dispatch('complete:post'));
        request.on('complete:delete', (e) => this.dispatch('complete:delete'));
        return request.fetch(method, body || this.body, headers || this.headers);
    }
    static cachedResponses = {};
    cache(key, value, isComplete = false, ttl = 5000) {
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
    isCached(key) {
        return !!ActiveRecord.cachedResponses[key];
    }
    isCachePending(key) {
        return (this.isCached(key) &&
            (!this.getCache(key).complete || this.getCache(key).failed));
    }
    getCache(key) {
        return ActiveRecord.cachedResponses[key];
    }
    addCacheSubscriber(key, resolve, reject, collection) {
        const cache = this.getCache(key);
        cache.subscribers.push({ collection, reject, resolve });
    }
    clearCacheSubscribers(key) {
        const cache = this.getCache(key);
        cache.subscribers = [];
    }
    FetchComplete(request, e, options = {}) {
        var method = request.method || 'get';
        this.hasLoaded = true;
        this.loading = false;
        this.dispatch('complete', request.data);
    }
    FetchProgress(request, e, options = {}) {
        this.dispatch('progress', e.data);
    }
    FetchParseAfter(request, e, options = {}) {
        const response = request.response;
        const code = response.status;
        if (code < 400) {
            this.setAfterResponse(request, options);
        }
        this.dispatch('fetched', this);
    }
}
//# sourceMappingURL=ActiveRecord.js.map