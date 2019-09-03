import { ClientConstructorArguments } from './client';
import Stateful from './stateful';
import { LivySessionState } from './session';
export declare type LivyBatchSession = {
    id: number;
    state: string;
    appId?: string;
    appInfo?: string;
    log?: string[];
};
declare type LivyBatchSessionAvailability = Array<{
    value: LivySessionState;
    done: boolean;
}>;
export default class BatchSession extends Stateful<LivyBatchSession, LivyBatchSessionAvailability> {
    protected availability: {
        value: LivySessionState;
        done: boolean;
    }[];
    constructor(s: LivyBatchSession, arg: ClientConstructorArguments);
    private die;
    private onRequestError;
    state(): Promise<{
        id: number;
        state: string;
    }>;
    kill(): Promise<{}>;
    log(param?: {
        from?: number;
        size?: number;
    }): Promise<{
        id: number;
        from: number;
        size: number;
        log: string[];
    }>;
}
export {};
