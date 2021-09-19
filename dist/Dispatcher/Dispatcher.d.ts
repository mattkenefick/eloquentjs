import DispatcherEvent from './DispatcherEvent';
export default class Dispatcher {
    events: Record<string, DispatcherEvent>;
    constructor();
    trigger(eventName: string, data?: Record<string, any>): void;
    dispatch(eventName: string, data?: Record<string, any>): void;
    on(eventName: string, callback: (data?: Record<string, unknown>) => void): void;
    off(eventName: string, callback?: () => void): void;
}
