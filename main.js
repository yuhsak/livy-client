const Axios = require('axios')

class Client {

	constructor({protocol='http', host='localhost', port=8998, ua='Livy Client for Node.js', agent}={}) {
		this.protocol = protocol
		this.host = host
		this.port = port
		this.agent = agent || Axios.create({
			baseURL: `${this.protocol}://${this.host}:${this.port}/`,
			headers: {
				'UserAgent': ua
			},
			responseType: 'json'
		})
	}

	endpoint(...paths) {
		return paths.join('/')
	}

	validateResponse(resolve, reject) {
		return res => res.status == 200 ? resolve(res.data) : reject('Response not 200')
	}

	async request(method='get', path, data) {
		const opt = Object.assign({
			method,
			url: path
		}, data?{data}:{})
		return new Promise((resolve, reject)=> this.agent.request(opt).then(this.validateResponse(resolve, reject)))
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

}

class LivyClient extends Client {

	constructor(opt={}) {
		super(opt)
	}

	async sessions({from=0, size=20}={}) {
		return this.get(`sessions?from=${from}&size=${size}`).then(r=>r.sessions)
	}

	session(id) {
		return new Session(id, {protocol: this.protocol, host: this.host, port: this.port, ua: this.ua})
	}

}

class Session extends Client {

	constructor(id, opt={}) {
		super(opt)
		this.id = id
		this.path = `sessions/${this.id}`
	}

	async info() {
		return this.get(this.path)
	}

	async state() {
		return this.get(`${this.path}/state`)
	}

	async delete() {
		return this.delete(this.path)
	}

	async log() {
		return this.get(`${this.path}/log`)
	}

	async statements() {
		return this.get(`${this.path}/statements`).then(r=>r.statements)
	}

	statement(id) {
		return new Statement(this.id, id, {protocol: this.protocol, host: this.host, port: this.port, ua: this.ua})
	}

}

class Statement extends Session {

	constructor(sessionId, id, opt={}) {
		super(sessionId, opt)
		this.id = id
		this.path = `${this.path}/statements/${this.id}`
	}

	async cancel() {
		return this.post(`${this.path}/cancel`)
	}

}

module.exports = LivyClient