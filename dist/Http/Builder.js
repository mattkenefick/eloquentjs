"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Builder
 *
 * @type
 */
class Builder {
    /**
     * Constructor
     */
    constructor(activeRecord) {
        /**
         * ID
         *
         * @type string
         */
        this.id = '';
        /**
         * List of includes
         *
         * @type string[]
         */
        this.includes = [];
        /**
         * List of query params
         *
         * @type object
         */
        this.queryParams = {};
        this.activeRecord = activeRecord;
    }
    /**
     * Base Url
     *
     * @type string
     */
    get baseUrl() {
        return this.activeRecord.baseUrl;
    }
    /**
     * Endpoint
     *
     * @type string
     */
    get endpoint() {
        return this.activeRecord.modifiedEndpoint || this.activeRecord.endpoint;
    }
    /**
     * Query params
     *
     * @todo Move to a builder?
     *
     * @type string
     */
    get queryParamsAsString() {
        let str = '';
        // Combine query params
        // for (let [key, value] of this.queryParams) {
        for (let key in this.queryParams) {
            let value = this.queryParams[key];
            if (value != null && value != '') {
                str += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }
        }
        // Add includes
        if (this.includes.length) {
            str += '&include=' + this.includes.join(',');
        }
        return str;
    }
    /**
     * Requestable URL
     *
     * @return string
     */
    get url() {
        const baseUrl = this.baseUrl;
        const endpoint = this.endpoint;
        const queryParamStr = this.queryParamsAsString;
        let urlBuilder = '';
        // Root API URI
        urlBuilder += baseUrl;
        urlBuilder += endpoint[0] === '/' ? endpoint : '/' + endpoint;
        // Check for ID
        if (this.id !== '') {
            urlBuilder += '/' + this.id;
        }
        // Separate query string
        urlBuilder += '?' + queryParamStr;
        return urlBuilder;
    }
    /**
     * Add an ID
     *
     * @param  number id
     * @return Builder
     */
    identifier(id) {
        this.id = id.toString();
        return this;
    }
    /**
     * Add an include
     *
     * @param  string  $value
     * @return Builder
     */
    include(value) {
        this.includes.push(value);
        return this;
    }
    /**
     * Add a query parameter
     *
     * @param  string  key
     * @param  string  value
     * @return Builder
     */
    queryParam(key, value) {
        this.queryParams[key] = value;
        return this;
    }
    /**
     * Short hand for query parameter
     *
     * @param  string key
     * @param  string | number value
     * @return Builder
     */
    qp(key, value) {
        return this.queryParam(key, value);
    }
}
exports.default = Builder;
//# sourceMappingURL=Builder.js.map