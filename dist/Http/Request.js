"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import fetch from 'node-fetch';
const Core_1 = __importDefault(require("../Core"));
/**
 * Request Error
 */
class RequestError extends Error {
    constructor(status, text) {
        super(text);
        this.status = status;
        this.text = text;
    }
}
/**
 * Request
 *
 * @todo
 */
class Request extends Core_1.default {
    /**
     * Constructor
     */
    constructor(url, params = {}) {
        super();
        /**
         * Parsed data from response
         *
         * @type {object}
         */
        this.data = {};
        /**
         * Where to find the data
         *
         * @type {string}
         */
        this.dataKey = '';
        /**
         * Headers
         *
         * Do not set the 'Content-Type' here because it wont be
         * overridden; which will break file uploads.
         *
         * @type {string}
         */
        this.headers = {};
        /**
         * If this request is currently loading
         *
         * @type {boolean}
         */
        this.loading = false;
        /**
         * Methods
         *
         * Example: 'cors'
         *
         * @type {string}
         */
        this.mode = '';
        /**
         * HTTP Timeout
         *
         * @type number
         */
        this.requestTimeout = 1000 * 5;
        //
        this.dataKey = params.dataKey;
        this.url = url;
        // Fix URL
        this.url = this.url.replace(/\?$/, '');
        this.url = this.url.replace(/\?&/, '?');
    }
    /**
     * Actually fetch the data
     */
    fetch(method = 'GET', body = null, headers = {}) {
        this.dispatch('fetch:before');
        // Combine headers
        var headers = Object.assign(this.headers, headers);
        // Fetch params
        var params = {};
        params.headers = headers;
        params.method = method || 'GET';
        params.redirect = 'follow';
        if (body) {
            params.body =
                body instanceof FormData
                    ? body
                    : (typeof (body) == 'object'
                        ? JSON.stringify(body)
                        : body);
        }
        // Is File?
        var isFile = !params.headers['Content-Type'] && params.method === 'POST';
        // Loading
        this.loading = true;
        // Events
        this.dispatch('requesting', this);
        // Log
        console.log('Making request as follows five:', this.url, params);
        // Abort controller
        // @todo, we need to add this proper
        // var controller = new AbortController();
        // params.signal = controller.signal;
        // Create request
        var response = isFile
            ? this.xhrFetch(this.url, params)
            : fetch(this.url, params);
        response
            .then(() => console.log('fucker'))
            .catch((e) => console.log(e));
        // Abort, if exists
        // setTimeout(() => {
        //     if (controller && controller.abort) {
        //         console.log('Aborting the request');
        //         controller.abort();
        //     }
        // }, this.requestTimeout);
        return response
            .then(this.beforeParse.bind(this))
            .then(this.parse.bind(this))
            .then(this.afterParse.bind(this))
            .then(this.afterFetch.bind(this))
            .then(this.afterAll.bind(this));
    }
    /**
     * XHR Fetch
     *
     * Specifically for file uploaders
     *
     * XMLHttpRequest
     *     onabort: null
     *     onerror: ƒ ()
     *     onload: ƒ ()
     *     onloadend: ƒ (e)
     *     onloadstart: null
     *     onprogress: ƒ (e)
     *     onreadystatechange: null
     *     ontimeout: null
     *     readyState: 4
     *     response: "{"id":262,"url":"https:\/\/static.sotw.com\/media\/film\/154\/5f2d54d1c26dc.jpg",
     *     responseText: "{"id":262,"url":"https:\/\/static.sotw.com\/media\/film\/154\/5f2d54d1c26dc.jpg",
     *     responseType: ""
     *     responseURL: "https://api.sotw.com/v1/film/154/media?&mediaType=1&imageType=4&videoType=4&limit=15&page=1"
     *     responseXML: null
     *     send: ƒ ()
     *     status: 200
     *     statusText: "OK"
     *     timeout: 0
     *     upload: XMLHttpRequestUpload {onloadstart: null, onprogress: null, onabort: null, onerror: null, onload: null, …}
     *     withCredentials: false
     *
     * Response
     *     body: (...)
     *     bodyUsed: false
     *     headers: Headers {}
     *     ok: true
     *     redirected: false
     *     status: 200
     *     statusText: ""
     *     type: "default"
     *     url: ""
     *
     * @param  {string} url
     * @param  {any} params
     * @return {any}
     */
    xhrFetch(url, params) {
        var self = this;
        var xhr = new XMLHttpRequest();
        // Open Request
        xhr.open(params.method, url);
        // Set Headers
        for (var key in params.headers) {
            xhr.setRequestHeader(key, params.headers[key]);
        }
        // Copy old `send`
        const xhrSend = xhr.send;
        // Create new `send`
        xhr.send = function () {
            const xhrArguments = arguments;
            return new Promise(function (resolve, reject) {
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        self.dispatch('progress', {
                            loaded: e.loaded,
                            ratio: e.loaded / e.total,
                            total: e.total,
                        });
                    }
                    else {
                        self.dispatch('progress', {
                            loaded: e.loaded,
                            ratio: 1,
                            total: e.total,
                        });
                    }
                };
                // xhr.onloadend = function(e: ProgressEvent) {
                //     const xhr: XMLHttpRequest = <XMLHttpRequest> e.currentTarget;
                //     var status = xhr.status;
                //     var json = JSON.parse(xhr.response);
                //     // Error
                //     if (status >= 400) {
                //         reject({
                //             status: status,
                //             statusText: json.status,
                //         });
                //         // throw new RequestError(status, json.status);
                //     }
                // }
                xhr.onload = function () {
                    var blob = new Blob([xhr.response], { type: 'application/json' });
                    var init = {
                        status: xhr.status,
                        statusText: xhr.statusText,
                    };
                    var response = new Response(blob, init);
                    // Resolved
                    resolve(response);
                    // if (xhr.status < 200 || xhr.status >= 300) {
                    //     reject({ response });
                    // }
                    // else {
                    //     resolve(response);
                    // }
                };
                xhr.onerror = function () {
                    reject({
                        request: xhr
                    });
                };
                xhrSend.apply(xhr, xhrArguments);
            });
        };
        return xhr.send(params.body);
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
        this.headers = headers;
    }
    /**
     * Before parsing data
     *
     * @todo Check if we have valid JSON
     * @todo Check if the request was an error
     *
     * @param {any} x [description]
     */
    beforeParse(response) {
        console.log('Request before parse.');
        // Trigger
        this.dispatch('parse:before');
        // Save
        this.response = response;
        return this;
    }
    /**
     * Parse data
     *
     * @param {any} x [description]
     */
    async parse(request) {
        // Trigger
        this.dispatch('parse:parsing');
        // Set data
        if (request.response) {
            // Data on 200 OK
            // if (request.response.status == 200) {
            if (request.response.status != 204) {
                this.data = await request.response.json();
            }
        }
        // Trigger
        this.dispatch('parse', this.data);
        return request;
    }
    /**
     * After data parsed
     *
     * @param {any} x [description]
     */
    afterParse(request) {
        if (request && request.response && request.response.status >= 400 && this.data.status) {
            // if (this.data && this.data.code >= 400) {
            throw new RequestError(request.response.status, this.data.status);
        }
        // Trigger
        this.dispatch('parse:after');
        return request;
    }
    /**
     * After data fetched
     *
     * @param {any} x [description]
     */
    afterFetch(request) {
        // Trigger
        this.dispatch('fetch', request.data);
        // Trigger
        this.dispatch('fetch:after');
        // Not loading
        this.loading = false;
        // Flag
        console.log('Request fetch complete.');
        return request;
    }
    /**
     * After all
     *
     * @param {any} x [description]
     */
    afterAll(request) {
        // Check request
        if (request && request.response && request.response.ok) {
            this.dispatch('complete', this);
        }
        else {
            this.dispatch('error');
            throw new Error('Failed response, after all');
        }
        // Flag
        console.log('Request complete.');
        return request;
    }
}
exports.default = Request;
//# sourceMappingURL=Request.js.map