import { AxiosInstance, AxiosResponse } from 'axios';
import EventEmitter from 'eventemitter3';
export declare type RequestError = {
    isStatusError: boolean;
    status?: number;
    code?: string;
    response?: AxiosResponse;
};
export declare type ClientConstructorArguments = {
    protocol?: string;
    host?: string;
    port?: string | number;
    autoupdate?: boolean;
    updateInterval?: number;
    headers?: any;
    agent?: AxiosInstance;
};
export default class Client<ObjectType = any> extends EventEmitter {
    protocol: string;
    host: string;
    port: string | number;
    autoupdate: boolean;
    updateInterval: number;
    agent: AxiosInstance;
    path: string;
    protected headers?: any;
    protected o: ObjectType;
    constructor({ protocol, host, port, autoupdate, updateInterval, headers, agent }?: ClientConstructorArguments);
    private validateResponse;
    private requestError;
    private updateState;
    private request;
    protected get(path: string): Promise<any>;
    protected post(path: string, data?: {}): Promise<any>;
    protected delete(path: string): Promise<any>;
    update(): Promise<this>;
    status(): Promise<ObjectType>;
    startUpdate(): this;
    stopUpdate(): this;
    cleanup(): this;
    toObject(): ObjectType;
    json(): ObjectType;
}
