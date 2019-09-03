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
const client_1 = __importDefault(require("./client"));
const batch_session_1 = __importDefault(require("./batch-session"));
class Batch extends client_1.default {
    constructor(arg) {
        super(arg);
        this.path = '/batches';
        this.o = [];
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessions();
        });
    }
    sessions({ from = 0, size = 100, autoupdate = false } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(`${this.path}?from=${from}&size=${size}`).then(r => {
                return r.sessions ? r.sessions.map((s) => this.Session(s, { autoupdate })) : [];
            });
        });
    }
    createSession(param, { autoupdate = true } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.post(this.path, param);
            return this.Session(res, { autoupdate });
        });
    }
    Session(s, { autoupdate = true } = {}) {
        return new batch_session_1.default(s, { protocol: this.protocol, host: this.host, port: this.port, headers: this.headers, autoupdate });
    }
    cleanup() {
        this.stopUpdate();
        this.removeAllListeners();
        this.o.forEach(s => s.cleanup());
        this.o = [];
        return this;
    }
}
exports.default = Batch;
