"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ActiveRecord_1 = __importDefault(require("./ActiveRecord"));
/**
 * [Eloquent description]
 *
 * @type {[type]}
 */
class Model extends ActiveRecord_1.default {
    /**
     * Constructor
     */
    constructor(attributes = {}, options = {}) {
        super(options);
        /**
         * Hash of attributes whos current + previous value differ
         *
         * @type {object}
         */
        this.changed = {};
        /**
         * List of fields available
         *
         * @type string[]
         */
        this.fields = [];
        /**
         * List of relationships available
         *
         * @type object
         */
        this.relationships = {};
        /**
         * List of fields available
         *
         * @type string[]
         */
        this.rules = [];
        /**
         * Error during validation
         *
         * @type {any}
         */
        this.validationError = null;
        /**
         * The key that collection data exists on, e.g.
         *
         * {
         *     data: [ .. ]
         * }
         *
         * @type string
         */
        this.dataKey = undefined;
        /**
         * Instance cache for relationships
         */
        this.relationshipCache = {};
        // Set defaults
        this.changed = {};
        this.cid = this.cidPrefix + Math.random().toString(36).substr(2, 5);
        // Set default content type header
        this.setHeader('Content-Type', 'application/json; charset=utf8');
        // Set attributes
        this.set(attributes);
    }
    /**
     * Hydrate
     *
     * @type {any}
     */
    static hydrate(attributes = {}, options = {}) {
        // Instantiate collection
        const collection = new this(options);
        // Add models to collection
        collection.set(attributes);
        // Add options to collection
        collection.options(options);
        return collection;
    }
    /**
     * Set attributes by hashmap
     *
     * @note Unsure if we should delete existing relationships
     * or `set` on them. I think we have failures with the `set`
     *
     * @param object = {} hash
     *
     * @return ActiveRecord
     */
    set(hash = {}) {
        // mk: 29, we disabled this because it breaks references
        // but we had previously enabled it for some reason.
        // What would that reason be?
        // This forces a reset of relationship caches
        // for (let key in hash) {
        //     // @ts-ignore
        //     if (this.relationshipCache[key]) {
        //         // @ts-ignore
        //         delete this.relationshipCache[key];
        //     }
        // }
        // Don't trigger event
        super.set(hash, false);
        // Check attributes if everything looks ok
        if (this.attributes.data && this.attributes.data.length) {
            console.warn('This model is incorrectly getting collection data.', this);
        }
        // Update any relationship caches that exist
        // Don't delete them, as to save references
        let key;
        for (key in hash) {
            if (this.relationshipCache[key]) {
                this.relationshipCache[key].set(hash[key]);
            }
        }
        // Trigger event
        this.dispatch('set');
        return this;
    }
    // /**
    //  * Save model
    //  *
    //  * @todo There so much to do to fix this
    //  *
    //  * @param  {any = {}} options
    //  * @param  {any = {}} queryParams
    //  * @return {any}
    //  */
    // public save(attributes: any): any
    // {
    //     // Query params
    //     const url: string = this.builder
    //         .identifier(this.id)
    //         .url;
    //     // Attributes
    //     const body: any = attributes || this.attributes;
    //     const headers: any = this.headers;
    //     const method: string = this.id ? 'PUT' : 'POST';
    //     return this._fetch(null, {}, method, body, headers);
    // }
    // /**
    //  * Used to get an individual item in a model
    //  *
    //  * Can pass either an ID #XX or a slug
    //  *
    //  * @param  {string | number} id
    //  * @return {Promise}
    //  */
    // public async find(id: string | number, queryParams: IModelRequestQueryParams = {}): Promise<any>
    // {
    //     var self: any = this;
    //     return await super.find(id, queryParams)
    //         .then((request: any) => {
    //             return this;
    //         });
    // }
    /**
     * Public generic fetch method
     *
     * @param  {IModelRequestOptions | null = {}} options
     * @param  {IModelRequestQueryParams = {}} queryParams
     * @return {Promise}
     */
    async fetch(options = {}, queryParams = {}) {
        // Query params
        this.builder.identifier(options && options.id ? options.id : this.id);
        // Check if ID exists
        if (!(options && options.id) && !this.id) {
            console.warn('Fetching model without ID is likely incorrect behavior.', this, this.id, this.toJSON());
        }
        // Fetch
        return await super.fetch(options, queryParams);
    }
    // /**
    //  * Delete Model
    //  *
    //  * @todo There's a ton to do here too
    //  */
    // public delete(): any
    // {
    //     // Query params
    //     const url: string = this.builder
    //         .identifier(this.id)
    //         .url;
    //     // Set fetch
    //     return this._fetch(null, {}, 'DELETE');
    // }
    // Relationships
    // ------------------------------------------------------------------------
    /**
     * Return singular instance of related contnet
     *
     * @param  {string} relationshipName
     * @param  {any} relationshipClass
     * @return {any}
     */
    hasOne(relationshipName, relationshipClass) {
        if (this.relationshipCache[relationshipName]) {
            return this.relationshipCache[relationshipName];
        }
        var content = this.attr(relationshipName) || {};
        var model = new relationshipClass(content);
        return this.relationshipCache[relationshipName] = model;
    }
    /**
     * Return multiple instances of related content
     *
     * @param  {string} relationshipName
     * @param  {any} relationshipClass
     * @return {any}
     */
    hasMany(relationshipName, relationshipClass) {
        if (this.relationshipCache[relationshipName]) {
            return this.relationshipCache[relationshipName];
        }
        const content = this.attr(relationshipName) || { data: [] };
        const collection = relationshipClass.hydrate(content.data || content);
        return this.relationshipCache[relationshipName] = collection;
    }
    /**
     * Validates data
     *
     * @todo Not implemented
     *
     * @return boolean
     */
    validate(attributes, options = {}) {
        if (!this.validate || !options.validate) {
            return true;
        }
        // const attributes:
        return false;
    }
}
exports.default = Model;
//# sourceMappingURL=Model.js.map