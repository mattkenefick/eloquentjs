import { Dispatcher } from 'dispatcher';
import { IDispatcher } from './Interfaces';
/**
 * Core
 *
 * Base level class related to core functionality of models, collections,
 * utlities, etc
 */
export default class Core extends Dispatcher implements IDispatcher {
    /**
     * [constructor description]
     * @param {object = {}} options
     */
    constructor(options?: object);
    trigger(eventName: string, data?: any): void;
    dispatch(eventName: string, data?: any): void;
    on(eventName: string, callback: (data?: any) => void): void;
    off(eventName: string, callback?: any): void;
}
