import Client, { ClientConstructorArguments } from './client';
declare type StatefulObject = {
    id: number;
    state: string;
};
declare type Availability = Array<{
    value: string;
    done: boolean;
}>;
export default class Stateful<ObjectType extends StatefulObject, AvailabilityType extends Availability> extends Client<ObjectType> {
    id: number;
    protected availability: AvailabilityType;
    constructor(s: ObjectType, arg: ClientConstructorArguments);
    private onUpdate;
    status(): Promise<ObjectType>;
}
export {};
