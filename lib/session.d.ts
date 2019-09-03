import { ClientConstructorArguments } from './client';
import Stateful from './stateful';
import Statement, { LivyStatement } from './statement';
export declare enum LivySessionKind {
    spark = "spark",
    pyspark = "pyspark",
    sparkr = "sparkr",
    sql = "sql",
    shared = "shared"
}
export declare enum LivySessionState {
    not_started = "note_started",
    starting = "starting",
    idle = "idle",
    busy = "busy",
    shutting_down = "shutting_down",
    recovering = "recovering",
    error = "error",
    dead = "dead",
    success = "success"
}
export declare type LivySession = {
    id: number;
    state: LivySessionState;
    appId?: string;
    owner?: string;
    proxyUser?: string;
    kind?: LivySessionKind;
    log?: string[];
    appInfo?: any;
};
declare type LivySessionAvailability = Array<{
    value: LivySessionState;
    done: boolean;
}>;
export default class Session extends Stateful<LivySession, LivySessionAvailability> {
    protected availability: {
        value: LivySessionState;
        done: boolean;
    }[];
    constructor(s: LivySession, arg: ClientConstructorArguments);
    private onRequestError;
    private die;
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
    statements(): Promise<Statement[]>;
    run(param: {
        code: string;
        kind?: LivySessionKind;
    }, { autoupdate }?: {
        autoupdate?: boolean;
    }): Promise<Statement>;
    Statement(s: LivyStatement, { autoupdate }?: {
        autoupdate?: boolean | undefined;
    }): Statement;
}
export {};
