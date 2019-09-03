import Client, {ClientConstructorArguments} from './client'
import BatchSession, {LivyBatchSession} from './batch-session'

export type BatchSessionRequestBody = {
	file: string,
	proxyUser?: string,
	className?: string,
	args?: string[],
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
	conf?: any
}

export default class Batch extends Client<BatchSession[]> {
	
	constructor(arg:ClientConstructorArguments) {
		super(arg)
		this.path = '/batches'
		this.o = []
	}

	async status() {
		return this.sessions()
	}

	async sessions({from=0, size=100, autoupdate=false}={}) {
		return this.get(`${this.path}?from=${from}&size=${size}`).then(r=>{
			return r.sessions ? r.sessions.map((s:LivyBatchSession)=>this.Session(s, {autoupdate})) : []
		})
	}

	async createSession(param: BatchSessionRequestBody, {autoupdate=true}:{autoupdate?:boolean}={}) {
		const res = await this.post(this.path, param)
		return this.Session(res, {autoupdate})
	}

	Session(s:LivyBatchSession, {autoupdate=true}:{autoupdate?:boolean}={}) {
		return new BatchSession(s, {protocol: this.protocol, host: this.host, port: this.port, headers: this.headers, autoupdate})
	}

	cleanup() {
		this.stopUpdate()
		this.removeAllListeners()
		this.o.forEach(s=>s.cleanup())
		this.o = []
		return this
	}

}