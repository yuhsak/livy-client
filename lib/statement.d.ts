import Stateful from './stateful';
import { ClientConstructorArguments } from './client';
import { LivySession, LivySessionKind } from './session';
export declare enum LivyStatementState {
    waiting = "waiting",
    running = "running",
    available = "available",
    error = "error",
    cancelling = "cancelling",
    cancelled = "cancelled"
}
export declare type LivyStatementOutput = {
    status: string;
    execution_count: number;
    data?: any;
};
export declare type LivyStatement = {
    id: number;
    state: LivyStatementState;
    code: string;
    output?: LivyStatementOutput;
};
declare type LivyStatementAvailability = Array<{
    value: LivyStatementState;
    done: boolean;
}>;
export default class Statement extends Stateful<LivyStatement, LivyStatementAvailability> {
    sessionId: number;
    protected availability: {
        value: LivyStatementState;
        done: boolean;
    }[];
    constructor(s: LivyStatement, session: LivySession, arg: ClientConstructorArguments);
    cancel(): Promise<{
        msg: string;
    }>;
    completion(param: {
        code: string;
        kind?: LivySessionKind;
        cursor?: number;
    }): Promise<{
        candidates: string[];
    }>;
}
export {};
