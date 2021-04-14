import Axios, { AxiosInstance, AxiosResponse, AxiosError, Method, AxiosRequestConfig } from 'axios'
import EventEmitter from 'eventemitter3'

const sleep = (ms:number):Promise<void> => new Promise(resolve=>setTimeout(resolve, ms))

const errorCode:{[key: number]: string} = {
	404: 'resourceNotExist',
	500: 'serverError'
}

export type RequestError = {
	isStatusError: boolean
	status?: number
	code?: string
	response?: AxiosResponse
}

export type ClientConstructorArguments = {
	protocol?: string
	host?: string
	port?: string|number
	autoupdate?: boolean
	updateInterval?: number
	headers?: any,
	agent?: AxiosInstance
}

export default class Client<ObjectType=any> extends EventEmitter {

	public protocol: string
	public host: string
	public port: string|number
	public autoupdate: boolean
	public updateInterval: number
	public agent: AxiosInstance
	public path: string
	protected headers?: any
	protected o:ObjectType

	constructor({protocol='http', host='localhost', port=8998, autoupdate=false, updateInterval=1000, headers, agent}:ClientConstructorArguments={}) {
		super()
		this.protocol = protocol
		this.host = host
		this.port = port
		this.autoupdate = autoupdate
		this.updateInterval = updateInterval
		this.headers = headers
		this.agent = agent || Axios.create({...{
			baseURL: `${this.protocol}://${this.host}:${this.port}`,
			responseType: 'json',
			timeout: 10*1000
		}, ...(headers?{headers}:{})})
		this.o = <any>{}
		this.path = ""
		this.autoupdate && this.update()
		this.on('requestError', e=>this.emit('error', e))
	}

	private validateResponse(resolve: (value?: any) => void, reject: (reason?: any) => void) {
		return (res:AxiosResponse) => res.status > 400 ? reject({config: res.config, response: res}) : resolve(res.data||{})
	}

	private requestError(resolve: (value?: any) => void, reject: (reason?: any) => void) {
		return (e:AxiosError) => {
			const data:RequestError = {isStatusError: true}
			if(e.isAxiosError){
				data.isStatusError = false
			}
			if(e.response) {
				data.response = e.response
				if(e.response.status){
					data.status = e.response.status
					data.code = errorCode[e.response.status]
				} else {
					data.code = 'connectionError'
				}
			}
			this.emit('requestError', data)
			reject(data)
		}
	}

	private updateState(o: any) {
		this.o = o
		this.emit('update', this.o)
		return this
	}

	private async request(method:Method='get', path:string, data?:any) {
		const opt = Object.assign({
			method,
			url: path
		}, data?{data}:{})
		return new Promise<AxiosResponse['data']>((resolve, reject)=>
			this.agent.request(opt)
				.then(this.validateResponse(resolve, reject))
				.catch(this.requestError(resolve, reject))
		)
	}

	protected async get(path: string) {
		return this.request('get', path)
	}

	protected async post(path: string, data={}) {
		return this.request('post', path, data)
	}

	protected async delete(path: string) {
		return this.request('delete', path)
	}

	async update() {
		this.path && this.path!="" && this.status().then(this.updateState.bind(this)).catch(()=>{})
		this.autoupdate && sleep(this.updateInterval).then(this.update.bind(this))
		return this
	}

	async status():Promise<ObjectType> {
		return this.get(this.path)
	}

	startUpdate() {
		if(!this.autoupdate){
			this.autoupdate = true
			this.update()
		}
		return this
	}

	stopUpdate() {
		this.autoupdate = false
		return this
	}

	cleanup() {
		this.stopUpdate()
		this.removeAllListeners()
		return this
	}

	toObject():ObjectType {
		return this.o
	}

	json():ObjectType {
		return this.toObject()
	}

}