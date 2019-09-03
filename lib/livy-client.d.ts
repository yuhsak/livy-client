import Client, { ClientConstructorArguments } from './client';
import Session, { LivySession, LivySessionKind } from './session';
import Batch from './batch';
export declare type SessionRequestBody = {
    kind?: LivySessionKind;
    proxyUser?: string;
    jars?: string[];
    pyFiles?: string[];
    files?: string[];
    driverMemory?: string;
    driverCores?: number;
    executorMemory?: string;
    executorCores?: number;
    numExecutors?: number;
    archives?: string[];
    queue?: string;
    name?: string;
    conf?: any;
    heartBeatTimeoutInSecond?: number;
};
export default class LivyClient extends Client<Session[]> {
    constructor(arg: ClientConstructorArguments);
    status(): Promise<any>;
    sessions({ from, size, autoupdate }?: {
        from?: number | undefined;
        size?: number | undefined;
        autoupdate?: boolean | undefined;
    }): Promise<any>;
    createSession(param?: SessionRequestBody, { autoupdate }?: {
        autoupdate?: boolean;
    }): Promise<Session>;
    Session(s: LivySession, { autoupdate }?: {
        autoupdate?: boolean;
    }): Session;
    Batch({ autoupdate }?: {
        autoupdate?: boolean;
    }): Batch;
    cleanup(): this;
}
