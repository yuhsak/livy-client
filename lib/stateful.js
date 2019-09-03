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
class Stateful extends client_1.default {
    constructor(s, arg) {
        super(arg);
        this.id = s.id;
        this.o = s;
        this.availability = [];
        this.on('update', this.onUpdate.bind(this));
    }
    onUpdate(o) {
        if (o.state) {
            this.emit(o.state, o);
        }
        this.availability.some(s => s.value == o.state && s.done) && this.cleanup();
    }
    status() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.get(this.path);
        });
    }
}
exports.default = Stateful;
