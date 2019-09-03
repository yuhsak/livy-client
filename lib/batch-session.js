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
const session_1 = require("./session");
class BatchSession extends stateful_1.default {
    constructor(s, arg) {
        super(s, arg);
        this.availability = [
            { value: session_1.LivySessionState.not_started, done: false },
            { value: session_1.LivySessionState.starting, done: false },
            { value: session_1.LivySessionState.idle, done: false },
            { value: session_1.LivySessionState.busy, done: false },
            { value: session_1.LivySessionState.shutting_down, done: false },
            { value: session_1.LivySessionState.recovering, done: false },
            { value: session_1.LivySessionState.error, done: true },
            { value: session_1.LivySessionState.dead, done: true },
            { value: session_1.LivySessionState.success, done: true }
        ];
        this.path = `batches/${this.id}`;
        this.on('requestError', this.onRequestError.bind(this));
    }
    die() {
        if (this.o.state) {
            this.o.state = session_1.LivySessionState.dead;
        }
        this.emit('update', this.o);
    }
    onRequestError(e) {
        e.code == 'resourceNotExist' && this.die();
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
}
exports.default = BatchSession;
