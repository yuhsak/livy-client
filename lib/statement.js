"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stateful_1 = __importDefault(require("./stateful"));
var LivyStatementState;
(function (LivyStatementState) {
    LivyStatementState["waiting"] = "waiting";
    LivyStatementState["running"] = "running";
    LivyStatementState["available"] = "available";
    LivyStatementState["error"] = "error";
    LivyStatementState["cancelling"] = "cancelling";
    LivyStatementState["cancelled"] = "cancelled";
})(LivyStatementState = exports.LivyStatementState || (exports.LivyStatementState = {}));
class Statement extends stateful_1.default {
    constructor(s, session, arg) {
        super(s, arg);
        this.availability = [
            { value: LivyStatementState.waiting, done: false },
            { value: LivyStatementState.running, done: false },
            { value: LivyStatementState.cancelling, done: false },
            { value: LivyStatementState.available, done: true },
            { value: LivyStatementState.error, done: true },
            { value: LivyStatementState.cancelled, done: true }
        ];
        this.sessionId = session.id;
        this.path = `${this.path}/statements/${this.id}`;
    }
    cancel() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.post(`${this.path}/cancel`);
        });
    }
    completion(param) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.post(`${this.path}/completion`, param);
        });
    }
}
exports.default = Statement;
