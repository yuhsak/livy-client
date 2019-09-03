import Stateful from './stateful'
import { ClientConstructorArguments } from './client'
import { LivySession, LivySessionKind } from './session'

export enum LivyStatementState {
	waiting = 'waiting',
	running = 'running',
	available = 'available',
	error = 'error',
	cancelling = 'cancelling',
	cancelled = 'cancelled'
}

export type LivyStatementOutput = {
	status: string,
	execution_count: number,
	data?: any
}

export type LivyStatement = {
	id: number,
	state: LivyStatementState,
	code: string,
	output?: LivyStatementOutput
}

type LivyStatementAvailability = Array<{value: LivyStatementState, done: boolean}>

export default class Statement extends Stateful<LivyStatement, LivyStatementAvailability> {

	public sessionId: number

	protected availability = [
		{value: LivyStatementState.waiting, done: false},
		{value: LivyStatementState.running, done: false},
		{value: LivyStatementState.cancelling, done: false},
		{value: LivyStatementState.available, done: true},
		{value: LivyStatementState.error, done: true},
		{value: LivyStatementState.cancelled, done: true}
	]

	constructor(s: LivyStatement, session: LivySession, arg: ClientConstructorArguments) {
		super(s, arg)
		this.sessionId = session.id
		this.path = `${this.path}/statements/${this.id}`
	}

	async cancel():Promise<{msg: string}> {
		return this.post(`${this.path}/cancel`)
	}

	async completion(param :{code: string, kind?: LivySessionKind, cursor?: number}) :Promise<{candidates: string[]}> {
		return this.post(`${this.path}/completion`, param)
	}

}