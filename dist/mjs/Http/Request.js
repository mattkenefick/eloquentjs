import fetch from 'node-fetch';
import Core from '../Core';
class RequestError extends Error {
    status;
    text;
    constructor(status, text) {
        super(text);
        this.status = status;
        this.text = text;
    }
}
export default class Request extends Core {
    data = {};
    dataKey = '';
    headers = {};
    loading = false;
    method = 'get';
    mode = '';
    request;
    response;
    url;
    constructor(url, params = {}) {
        super();
        this.dataKey = params.dataKey;
        this.url = url;
        this.url = this.url.replace(/\?$/, '');
        this.url = this.url.replace(/\?&/, '?');
    }
    fetch(method = 'GET', body = null, headers = {}) {
        this.method = method || 'GET';
        this.dispatch('fetch:before');
        var headers = Object.assign(this.headers, headers);
        var params = {};
        params.headers = headers;
        params.method = method || 'GET';
        params.redirect = 'follow';
        body instanceof FormData
            ? body
            : typeof body == 'object'
                ? JSON.stringify(body)
                : body;
        if (body) {
            if (typeof FormData == undefined) {
                params.body =
                    typeof body == 'object' ? JSON.stringify(body) : body;
            }
            else {
                params.body =
                    body instanceof FormData
                        ? body
                        : typeof body == 'object'
                            ? JSON.stringify(body)
                            : body;
            }
        }
        var isFile = (!params.headers['Content-Type'] ||
            params.headers['Content-Type'].indexOf('multipart')) &&
            params.method.toLowerCase() === 'post';
        this.loading = true;
        this.dispatch('requesting', this);
        var response = isFile
            ? this.xhrFetch(this.url, params)
            : fetch(this.url, params);
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
                    var blob = new Blob([xhr.response], {
                        type: 'application/json',
                    });
                    var init = {
                        status: xhr.status,
                        statusText: xhr.statusText,
                    };
                    var response = new Response(xhr.response ? blob : null, init);
                    resolve(response);
                };
                xhr.onerror = function () {
                    reject({
                        request: xhr,
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
    async parse(request) {
        this.dispatch('parse:parsing');
        if (request.response) {
            if (request.response.status != 204) {
                this.data = await request.response.json();
            }
        }
        this.dispatch('parse', this.data);
        return request;
    }
    afterParse(request) {
        if (request &&
            request.response &&
            request.response.status >= 400 &&
            this.data.status) {
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
            this.dispatch('complete:' + this.method, this);
        }
        else {
            this.dispatch('error', request.data);
            throw new Error(request && request.data
                ? request.data.error || request.data.message
                : 'After All');
        }
        return request;
    }
}
//# sourceMappingURL=Request.js.map