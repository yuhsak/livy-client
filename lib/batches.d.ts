import Client, { ClientConstructorArguments } from './client';
import BatchSession, { LivyBatchSession } from './batch-session';
export declare type BatchSessionRequestBody = {
    file: string;
    proxyUser?: string;
    className?: string;
    args?: string[];
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
};
export default class Batches extends Client<BatchSession[]> {
    constructor(arg: ClientConstructorArguments);
    status(): Promise<any>;
    sessions({ from, size, autoupdate }?: {
        from?: number | undefined;
        size?: number | undefined;
        autoupdate?: boolean | undefined;
    }): Promise<any>;
    createSession(param: BatchSessionRequestBody, { autoupdate }?: {
        autoupdate?: boolean;
    }): Promise<BatchSession>;
    Session(s: LivyBatchSession, { autoupdate }?: {
        autoupdate?: boolean;
    }): BatchSession;
    clearSessions(): void;
}
