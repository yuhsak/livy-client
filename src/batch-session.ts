import { ClientConstructorArguments, RequestError } from './client'
import Stateful from './stateful'
import {LivySessionState} from './session'

export type LivyBatchSession = {
	id: number,
	state: string,
	appId?: string,
	appInfo?: string,
	log?: string[]
}

type LivyBatchSessionAvailability = Array<{value: LivySessionState, done: boolean}>

export default class BatchSession extends Stateful<LivyBatchSession, LivyBatchSessionAvailability> {
	
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

	constructor(s: LivyBatchSession, arg: ClientConstructorArguments) {
		super(s, arg)
		this.path = `batches/${this.id}`
		this.on('requestError', this.onRequestError.bind(this))
	}

	private die() {
		if(this.o.state){
			this.o.state = LivySessionState.dead
		}
		this.emit('update', this.o)
	}

	private onRequestError(e:RequestError) {
		e.code == 'resourceNotExist' && this.die()
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

}