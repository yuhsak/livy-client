import { ClientConstructorArguments, RequestError } from './client'
import Stateful from './stateful'
import Statement, {LivyStatement} from './statement'

export enum LivySessionKind {
	spark = 'spark',
	pyspark = 'pyspark',
	sparkr = 'sparkr',
	sql = 'sql',
	shared = 'shared'
}

export enum LivySessionState {
	not_started = 'note_started',
	starting = 'starting',
	idle = 'idle',
	busy = 'busy',
	shutting_down = 'shutting_down',
	recovering = 'recovering',
	error = 'error',
	dead = 'dead',
	success = 'success'
}

export type LivySession = {
	id: number,
	state: LivySessionState,
	appId?: string,
	owner?: string,
	proxyUser?: string,
	kind?: LivySessionKind,
	log?: string[],
	appInfo?: any
}

type LivySessionAvailability = Array<{value: LivySessionState, done: boolean}>

export default class Session extends Stateful<LivySession, LivySessionAvailability> {

	protected availability = [
		{value: LivySessionState.not_started,		done: false},
		{value: LivySessionState.starting,			done: false},
		{value: LivySessionState.idle, 					done: false},
		{value: LivySessionState.busy,					done: false},
		{value: LivySessionState.shutting_down,	done: false},
		{value: LivySessionState.recovering,		done: false},
		{value: LivySessionState.error,					done: true},
		{value: LivySessionState.dead,					done: true},
		{value: LivySessionState.success,				done: true}
	]

	constructor(s:LivySession, arg:ClientConstructorArguments) {
		super(s, arg)
		this.path = `sessions/${this.id}`
		this.on('requestError', this.onRequestError.bind(this))
	}

	private onRequestError(e:RequestError) {
		e.code == 'resourceNotExist' && this.die()
	}

	private die() {
		if(this.o.state){
			this.o.state = LivySessionState.dead
		}
		this.emit('update', this.o)
	}

	async state():Promise<{id: number, state: string}> {
		return this.get(`${this.path}/state`)
	}

	async kill():Promise<{}> {
		return this.delete(this.path)
	}

	async log(param: {from?: number, size?: number}={}):Promise<{id: number, from: number, size: number, log: string[]}> {
		const q = Object.entries(param).map(([k,v]) => `${k}=${v}`).join('&')
		return this.get(`${this.path}/log${q!==''?'?':''}${q}`)
	}

	async statements():Promise<Statement[]> {
		return this.get(`${this.path}/statements`).then(r=>r.statements ? r.statements.map((s:LivyStatement)=>this.Statement(s, {autoupdate: false})) : [])
	}

	async run(param: {code: string, kind?: LivySessionKind}, {autoupdate=true,updateInterval=1000}:{autoupdate?: boolean,updateInterval?:number}={}) {
		const res = await this.post(`${this.path}/statements`, param)
		return this.Statement(res, {autoupdate,updateInterval})
	}

	Statement(s:LivyStatement, {autoupdate=true, updateInterval=1000}={}) {
		return new Statement(s, this.o, {protocol: this.protocol, host: this.host, port: this.port, headers: this.headers, autoupdate, updateInterval})
	}

}
