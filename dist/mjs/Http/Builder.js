export default class Builder {
    get baseUrl() {
        return this.activeRecord.baseUrl;
    }
    get endpoint() {
        return this.activeRecord.modifiedEndpoint || this.activeRecord.endpoint;
    }
    id = '';
    includes = [];
    queryParams = {};
    activeRecord;
    constructor(activeRecord) {
        this.activeRecord = activeRecord;
    }
    get queryParamsAsString() {
        let str = '';
        for (let key in this.queryParams) {
            let value = this.queryParams[key];
            if (value != null && value != '') {
                str +=
                    '&' +
                        encodeURIComponent(key) +
                        '=' +
                        encodeURIComponent(value);
            }
        }
        if (this.includes.length) {
            str += '&include=' + this.includes.join(',');
        }
        return str;
    }
    get url() {
        const baseUrl = this.baseUrl;
        const endpoint = this.endpoint;
        const queryParamStr = this.queryParamsAsString;
        let urlBuilder = '';
        urlBuilder += baseUrl;
        urlBuilder += endpoint[0] === '/' ? endpoint : '/' + endpoint;
        if (this.id !== '') {
            urlBuilder += '/' + this.id;
        }
        urlBuilder += '?' + queryParamStr;
        urlBuilder = urlBuilder.replace(/([a-zA-Z0-9])\/\//g, '$1/');
        return urlBuilder;
    }
    identifier(id) {
        this.id = id.toString();
        return this;
    }
    include(value) {
        this.includes.push(value);
        return this;
    }
    queryParam(key, value) {
        this.queryParams[key] = value;
        return this;
    }
    qp(key, value) {
        return this.queryParam(key, value);
    }
}
//# sourceMappingURL=Builder.js.map