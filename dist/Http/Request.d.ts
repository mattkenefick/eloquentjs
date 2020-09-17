import Core from '../Core';
import { IAttributes } from '../Interfaces';
/**
 * Request
 *
 * @todo
 */
export default class Request extends Core {
    /**
     * Parsed data from response
     *
     * @type {object}
     */
    data: IAttributes;
    /**
     * Where to find the data
     *
     * @type {string}
     */
    dataKey: string;
    /**
     * Headers
     *
     * Do not set the 'Content-Type' here because it wont be
     * overridden; which will break file uploads.
     *
     * @type {string}
     */
    headers: any;
    /**
     * If this request is currently loading
     *
     * @type {boolean}
     */
    loading: boolean;
    /**
     * Methods
     *
     * Example: 'cors'
     *
     * @type {string}
     */
    mode: string;
    /**
     * Last fetch
     *
     * @type {Promise<Repsonse>}
     */
    request?: Promise<Request | Response>;
    /**
     * HTTP Timeout
     *
     * @type number
     */
    requestTimeout: number;
    /**
     * Response from fetch
     *
     * @type Response
     */
    response?: Response;
    /**
     * @type {string}
     */
    url: string;
    /**
     * Constructor
     */
    constructor(url: string, params?: any);
    /**
     * Actually fetch the data
     */
    fetch(method?: string | null, body?: any, headers?: any): Promise<Request>;
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
    xhrFetch(url: string, params: any): any;
    /**
     * Set specific header
     *
     * @param  {string} header
     * @param  {string} value
     * @return {any}
     */
    setHeader(header: string, value: string): any;
    /**
     * Override and set headers
     *
     * @param  {any} headers
     * @return {any}
     */
    setHeaders(headers: any): any;
    /**
     * Before parsing data
     *
     * @todo Check if we have valid JSON
     * @todo Check if the request was an error
     *
     * @param {any} x [description]
     */
    private beforeParse;
    /**
     * Parse data
     *
     * @param {any} x [description]
     */
    private parse;
    /**
     * After data parsed
     *
     * @param {any} x [description]
     */
    private afterParse;
    /**
     * After data fetched
     *
     * @param {any} x [description]
     */
    private afterFetch;
    /**
     * After all
     *
     * @param {any} x [description]
     */
    private afterAll;
}
