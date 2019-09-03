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
const axios_1 = __importDefault(require("axios"));
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const errorCode = {
    404: 'resourceNotExist',
    500: 'serverError'
};
class Client extends eventemitter3_1.default {
    constructor({ protocol = 'http', host = 'localhost', port = 8998, autoupdate = false, updateInterval = 1000, headers, agent } = {}) {
        super();
        this.protocol = protocol;
        this.host = host;
        this.port = port;
        this.autoupdate = autoupdate;
        this.updateInterval = updateInterval;
        this.headers = headers;
        this.agent = agent || axios_1.default.create(Object.assign({
            baseURL: `${this.protocol}://${this.host}:${this.port}`,
            responseType: 'json',
            timeout: 10 * 1000
        }, (headers ? { headers } : {})));
        this.path = '/';
        this.o = {};
        this.autoupdate && this.update();
        this.on('requestError', e => this.emit('error', e));
    }
    validateResponse(resolve, reject) {
        return (res) => res.status > 400 ? reject({ config: res.config, response: res }) : resolve(res.data || {});
    }
    requestError(resolve, reject) {
        return (e) => {
            const data = { isStatusError: true };
            if (e.isAxiosError) {
                data.isStatusError = false;
            }
            if (e.response) {
                data.response = e.response;
                if (e.response.status) {
                    data.status = e.response.status;
                    data.code = errorCode[e.response.status];
                }
                else {
                    data.code = 'connectionError';
                }
            }
            this.emit('requestError', data);
            reject(data);
        };
    }
    updateState(o) {
        this.o = o;
        this.emit('update', this.o);
        return this;
    }
    request(method = 'get', path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const opt = Object.assign({
                method,
                url: path
            }, data ? { data } : {});
            return new Promise((resolve, reject) => this.agent.request(opt)
                .then(this.validateResponse(resolve, reject))
                .catch(this.requestError(resolve, reject)));
        });
    }
    get(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('get', path);
        });
    }
    post(path, data = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('post', path, data);
        });
    }
    delete(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('delete', path);
        });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.path && this.status().then(this.updateState.bind(this)).catch(() => { });
            this.autoupdate && sleep(this.updateInterval).then(this.update.bind(this));
            return this;
        });
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(this.path);
        });
    }
    startUpdate() {
        if (!this.autoupdate) {
            this.autoupdate = true;
            this.update();
        }
        return this;
    }
    stopUpdate() {
        this.autoupdate = false;
        return this;
    }
    cleanup() {
        this.stopUpdate();
        this.removeAllListeners();
        return this;
    }
    toObject() {
        return this.o;
    }
    json() {
        return this.toObject();
    }
}
exports.default = Client;
