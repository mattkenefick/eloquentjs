import ActiveRecord from '../ActiveRecord';
/**
 * Builder
 *
 * @type
 */
export default class Builder {
    /**
     * Base Url
     *
     * @type string
     */
    get baseUrl(): string;
    /**
     * Endpoint
     *
     * @type string
     */
    get endpoint(): string;
    /**
     * ID
     *
     * @type string
     */
    id: string;
    /**
     * List of includes
     *
     * @type string[]
     */
    includes: string[];
    /**
     * List of query params
     *
     * @type object
     */
    queryParams: any;
    /**
     * Reference to ActiveRecord we're building for
     *
     * @type {ActiveRecord}
     */
    private activeRecord;
    /**
     * Constructor
     */
    constructor(activeRecord: ActiveRecord);
    /**
     * Query params
     *
     * @todo Move to a builder?
     *
     * @type string
     */
    get queryParamsAsString(): string;
    /**
     * Requestable URL
     *
     * @return string
     */
    get url(): string;
    /**
     * Add an ID
     *
     * @param  number id
     * @return Builder
     */
    identifier(id: string | number): Builder;
    /**
     * Add an include
     *
     * @param  string  $value
     * @return Builder
     */
    include(value: string): Builder;
    /**
     * Add a query parameter
     *
     * @param  string  key
     * @param  string  value
     * @return Builder
     */
    queryParam(key: string, value: string | number): Builder;
    /**
     * Short hand for query parameter
     *
     * @param  string key
     * @param  string | number value
     * @return Builder
     */
    qp(key: string, value: string | number): Builder;
}
