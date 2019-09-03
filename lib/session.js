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
const statement_1 = __importDefault(require("./statement"));
var LivySessionKind;
(function (LivySessionKind) {
    LivySessionKind["spark"] = "spark";
    LivySessionKind["pyspark"] = "pyspark";
    LivySessionKind["sparkr"] = "sparkr";
    LivySessionKind["sql"] = "sql";
    LivySessionKind["shared"] = "shared";
})(LivySessionKind = exports.LivySessionKind || (exports.LivySessionKind = {}));
var LivySessionState;
(function (LivySessionState) {
    LivySessionState["not_started"] = "note_started";
    LivySessionState["starting"] = "starting";
    LivySessionState["idle"] = "idle";
    LivySessionState["busy"] = "busy";
    LivySessionState["shutting_down"] = "shutting_down";
    LivySessionState["recovering"] = "recovering";
    LivySessionState["error"] = "error";
    LivySessionState["dead"] = "dead";
    LivySessionState["success"] = "success";
})(LivySessionState = exports.LivySessionState || (exports.LivySessionState = {}));
class Session extends stateful_1.default {
    constructor(s, arg) {
        super(s, arg);
        this.availability = [
            { value: LivySessionState.not_started, done: false },
            { value: LivySessionState.starting, done: false },
            { value: LivySessionState.idle, done: false },
            { value: LivySessionState.busy, done: false },
            { value: LivySessionState.shutting_down, done: false },
            { value: LivySessionState.recovering, done: false },
            { value: LivySessionState.error, done: true },
            { value: LivySessionState.dead, done: true },
            { value: LivySessionState.success, done: true }
        ];
        this.path = `sessions/${this.id}`;
        this.on('requestError', this.onRequestError.bind(this));
    }
    onRequestError(e) {
        e.code == 'resourceNotExist' && this.die();
    }
    die() {
        if (this.o.state) {
            this.o.state = LivySessionState.dead;
        }
        this.emit('update', this.o);
    }
    state() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(`${this.path}/state`);
        });
    }
    kill() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.delete(this.path);
        });
    }
    log(param = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const q = Object.entries(param).map(([k, v]) => `${k}=${v}`).join('&');
            return this.get(`${this.path}/log${q !== '' ? '?' : ''}${q}`);
        });
    }
    statements() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(`${this.path}/statements`).then(r => r.statements ? r.statements.map((s) => this.Statement(s, { autoupdate: false })) : []);
        });
    }
    run(param, { autoupdate = true } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.post(`${this.path}/statements`, param);
            return this.Statement(res, { autoupdate });
        });
    }
    Statement(s, { autoupdate = true } = {}) {
        return new statement_1.default(s, this.o, { protocol: this.protocol, host: this.host, port: this.port, headers: this.headers, autoupdate });
    }
}
exports.default = Session;
