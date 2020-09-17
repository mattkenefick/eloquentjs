/**
 * Attributes
 *
 * @type interface
 */
export interface IAttributes {
    [key: string]: any;
}
/**
 * Meta data associated with collection
 *
 * @type interface
 */
export interface ICollectionMeta {
    pagination: IPagination;
}
/**
 * Model Request Options
 *
 * @type interface
 */
export interface IModelRequestOptions {
    id?: number | string;
    includes?: string[];
}
/**
 * Model Request Query Params
 *
 * Any type of query params
 *
 * @type interface
 */
export interface IModelRequestQueryParams {
    [key: string]: any;
}
/**
 * Pagination object coming from server
 *
 * @type interface
 */
export interface IPagination {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    links?: any;
}
/**
 * Sort options for collections
 *
 * @type interface
 */
export interface ISortOptions {
    key: string;
    reverse?: boolean;
}
export interface IDispatcher {
    trigger: (eventName: string, data?: any) => any;
    dispatch: (eventName: string, data?: any) => any;
    on: (eventName: string, callback: (data?: any) => void) => any;
    off: (eventName: string, callback?: any) => any;
}
