import Client, { ClientConstructorArguments, RequestError } from './client'

type StatefulObject = {
	id: number,
	state: string
}

type Availability = Array<{value: string, done: boolean}>

export default class Stateful<ObjectType extends StatefulObject, AvailabilityType extends Availability> extends Client<ObjectType> {

	public id: number
	protected availability: AvailabilityType

	constructor(s:ObjectType, arg:ClientConstructorArguments) {
		super(arg)
		this.id = s.id
		this.o = s
		this.availability = [] as any
		this.on('update', this.onUpdate.bind(this))
	}

	private onUpdate(o:ObjectType) {
		if(o.state){
			this.emit(o.state, o)
		}
		this.availability.some(s=>s.value==o.state&&s.done) && this.cleanup()
	}

	async status():Promise<ObjectType> {
		return this.get(this.path)
	}

}