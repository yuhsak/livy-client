import Client, {ClientConstructorArguments} from './client'
import Session, { LivySession, LivySessionKind } from './session'
import Batch from './batch'

export type SessionRequestBody = {
	kind?: LivySessionKind,
	proxyUser?: string,
	jars?: string[],
	pyFiles?: string[],
	files?: string[],
	driverMemory?: string,
	driverCores?: number,
	executorMemory?: string,
	executorCores?: number,
	numExecutors?: number,
	archives?: string[],
	queue?: string,
	name?: string,
	conf?: any,
	heartBeatTimeoutInSecond?: number
}

export default class LivyClient extends Client<Session[]> {

	constructor(arg:ClientConstructorArguments) {
		super(arg)
		this.path = '/sessions'
		this.o = []
	}

	async status() {
		return this.sessions()
	}

	async sessions({from=0, size=100, autoupdate=false}={}) {
		return this.get(`${this.path}?from=${from}&size=${size}`).then(r=>{
			return r.sessions ? r.sessions.map((s:LivySession)=>this.Session(s, {autoupdate})) : []
		})
	}

	async createSession(param:SessionRequestBody={}, {autoupdate=true}:{autoupdate?:boolean}={}) {
		const res = await this.post(`${this.path}`, param)
		return this.Session(res, {autoupdate})
	}

	Session(s:LivySession, {autoupdate=true}:{autoupdate?:boolean}={}) {
		return new Session(s, {protocol: this.protocol, host: this.host, port: this.port, headers: this.headers, autoupdate})
	}

	Batch({autoupdate=false}:{autoupdate?: boolean}={}) {
		return new Batch({protocol: this.protocol, host: this.host, port: this.port, headers: this.headers, autoupdate})
	}

	cleanup() {
		this.stopUpdate()
		this.removeAllListeners()
		this.o.forEach(s=>s.cleanup())
		this.o = []
		return this
	}

}