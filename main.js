const Axios = require('axios')
const EventEmitter = require('eventemitter3')

const sleep = (ms) => new Promise(resolve=>setTimeout(resolve,ms))

class Client extends EventEmitter {

	constructor({protocol='http', host='localhost', port=8998, ua='Livy Client for Node.js', autoupdate=true, updateInterval=1000, agent}={}) {
		super()
		this.protocol = protocol
		this.host = host
		this.port = port
		this.autoupdate = true
		this.updateInterval = updateInterval
		this.agent = agent || Axios.create({
			baseURL: `${this.protocol}://${this.host}:${this.port}`,
			headers: {
				'UserAgent': ua
			},
			responseType: 'json'
		})
		this.o = {}
		this.autoupdate && this.startUpdate()
	}

	validateResponse(resolve, reject) {
		return res => res.status > 400 ? reject(res) : resolve(res.data)
	}

	async request(method='get', path, data) {
		const opt = Object.assign({
			method,
			url: path
		}, data?{data}:{})
		return new Promise((resolve, reject)=> this.agent.request(opt).then(this.validateResponse(resolve, reject)).catch(this.requestError.bind(this)))
	}

	requestError(e) {
		const res = e.response || {}
		const data = Object.assign(
			res.status == 404 ? {code: 'resourceNotExist'} :
			res.status == 500 ? {code: 'serverError'} :
			!res.status ? {code: 'connectionError'} :
		{}, {status: res.status, statusText: res.statusText, headers: res.headers, config: res.config})
		this.emit('requestError', data)
	}

	async get(path) {
		return this.request('get', path)
	}

	async post(path, data={}) {
		return this.request('post', path, data)
	}

	async delete(path) {
		return this.request('delete', path)
	}

	updateState(o) {
		this.o = o
		this.emit('update', this.o)
		return this
	}

	startUpdate() {
		this.autoupdate = true
		this.update()
		return this
	}

	stopUpdate() {
		this.autoupdate = false
		return this
	}

	async update() {
		this.path && this.info().then(this.updateState.bind(this))
		this.autoupdate && sleep(this.updateInterval).then(this.update.bind(this))
		return this
	}

	async info() {
		return {}
	}

	cleanup() {
		this.autoupdate = false
		this.removeAllListeners()
	}

	toObject() {
		return this.o
	}

}

class LivyClient extends Client {

	constructor(...args) {
		super(...args)
		this.path = '/'
		this.on('requestError', e=>this.emit('error', e))
	}

	async info() {
		return this.sessions()
	}

	async sessions({from=0, size=20}={}) {
		return this.get(`/sessions?from=${from}&size=${size}`).then(r=>r.sessions.map(this.session.bind(this)))
	}

	async createSession({
		kind,
		proxyUser,
		jars,
		pyFiles,
		files,
		driverMemory,
		driverCores,
		executorMemory,
		executorCores,
		numExecutors,
		archives,
		queue,
		name,
		conf,
		heartbeatTimeoutInSecond
	}={}) {
		const data = {kind, proxyUser, jars, pyFiles, files, driverMemory, driverCores, executorMemory, executorCores, numExecutors, archives, queue, name, conf, heartbeatTimeoutInSecond}
		const res = await this.post(`/sessions`, data)
		return this.session(res.id)
	}

	session(s, {autoupdate=false}) {
		return new Session(s, {protocol: this.protocol, host: this.host, port: this.port, ua: this.ua, autoupdate})
	}

}

class Session extends Client {

	constructor(s, ...args) {
		super(...args)
		this.id = s.id
		this.o = s
		this.path = `sessions/${this.id}`
		this.states = [
			{value: 'not_started',		done: false},
			{value: 'starting',			done: false},
			{value: 'idle',				done: false},
			{value: 'busy',				done: false},
			{value: 'shutting_down',	done: false},
			{value: 'error',			done: true},
			{value: 'dead',				done: true},
			{value: 'success',			done: true}
		]
		this.on('update', this.onUpdate.bind(this))
	}

	onUpdate(o) {
		this.emit(o.state, o)
		this.states.some(s=>s.value==o.state&&s.done) && this.cleanup()
	}

	onRequestError(e) {
		e.code == 'resourceNotExist' && this.die()
	}

	die() {
		this.o.state = 'dead'
		this.emit('update', this.o)
	}

	async info() {
		return this.get(this.path)
	}

	async state() {
		return this.get(`${this.path}/state`)
	}

	async kill() {
		return this.delete(this.path)
	}

	async log() {
		return this.get(`${this.path}/log`)
	}

	async statements() {
		return this.get(`${this.path}/statements`).then(r=>r.statements)
	}

	async run(code) {
		const res = await this.post(`${this.path}/statements`, {code})
		return this.statement(res.id)
	}

	statement(s, {autoupdate=false}) {
		return new Statement(s, this.id, {protocol: this.protocol, host: this.host, port: this.port, ua: this.ua, autoupdate})
	}

}

class Statement extends Session {

	constructor(s, ...args) {
		super(...args)
		this.sessionId = this.id
		this.id = s.id
		this.o = s
		this.path = `${this.path}/statements/${this.id}`
		this.states = [
			{value: 'waiting',		done: false},
			{value: 'running',		done: false},
			{value: 'available',	done: false},
			{value: 'error',		done: true},
			{value: 'cancelling',	done: true},
			{value: 'cancelled',	done: true}
		]
	}

	async cancel() {
		return this.post(`${this.path}/cancel`)
	}

}

module.exports = LivyClient