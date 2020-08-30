System.register(["node-fetch", "../Core"], function (exports_1, context_1) {
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
    var node_fetch_1, Core_1, RequestError, Request;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (node_fetch_1_1) {
                node_fetch_1 = node_fetch_1_1;
            },
            function (Core_1_1) {
                Core_1 = Core_1_1;
            }
        ],
        execute: function () {
            RequestError = class RequestError extends Error {
                constructor(status, text) {
                    super(text);
                    this.status = status;
                    this.text = text;
                }
            };
            Request = class Request extends Core_1.default {
                constructor(url, params = {}) {
                    super();
                    this.data = {};
                    this.dataKey = '';
                    this.headers = {};
                    this.loading = false;
                    this.mode = '';
                    this.dataKey = params.dataKey;
                    this.url = url;
                    this.url = this.url.replace(/\?$/, '');
                    this.url = this.url.replace(/\?&/, '?');
                }
                fetch(method = 'GET', body = null, headers = {}) {
                    this.dispatch('fetch:before');
                    var headers = Object.assign(this.headers, headers);
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
                    var isFile = !params.headers['Content-Type'] && params.method === 'POST';
                    this.loading = true;
                    this.dispatch('requesting', this);
                    var response = isFile
                        ? this.xhrFetch(this.url, params)
                        : node_fetch_1.default(this.url, params);
                    return response
                        .then(this.beforeParse.bind(this))
                        .then(this.parse.bind(this))
                        .then(this.afterParse.bind(this))
                        .then(this.afterFetch.bind(this))
                        .then(this.afterAll.bind(this));
                }
                xhrFetch(url, params) {
                    var self = this;
                    var xhr = new XMLHttpRequest();
                    xhr.open(params.method, url);
                    for (var key in params.headers) {
                        xhr.setRequestHeader(key, params.headers[key]);
                    }
                    const xhrSend = xhr.send;
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
                            xhr.onload = function () {
                                var blob = new Blob([xhr.response], { type: 'application/json' });
                                var init = {
                                    status: xhr.status,
                                    statusText: xhr.statusText,
                                };
                                var response = new Response(blob, init);
                                resolve(response);
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
                setHeader(header, value) {
                    this.headers[header] = value;
                    return this;
                }
                setHeaders(headers) {
                    this.headers = headers;
                }
                beforeParse(response) {
                    this.dispatch('parse:before');
                    this.response = response;
                    return this;
                }
                parse(request) {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.dispatch('parse:parsing');
                        if (request.response) {
                            if (request.response.status != 204) {
                                this.data = yield request.response.json();
                            }
                        }
                        this.dispatch('parse', this.data);
                        return request;
                    });
                }
                afterParse(request) {
                    if (request && request.response && request.response.status >= 400 && this.data.status) {
                        throw new RequestError(request.response.status, this.data.status);
                    }
                    this.dispatch('parse:after');
                    return request;
                }
                afterFetch(request) {
                    this.dispatch('fetch', request.data);
                    this.dispatch('fetch:after');
                    this.loading = false;
                    return request;
                }
                afterAll(request) {
                    if (request && request.response && request.response.ok) {
                        this.dispatch('complete', this);
                    }
                    else {
                        this.dispatch('error');
                        throw new Error('Failed response, after all');
                    }
                    return request;
                }
            };
            exports_1("default", Request);
        }
    };
});
//# sourceMappingURL=Request.js.map