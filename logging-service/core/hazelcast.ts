import {Client} from 'hazelcast-client';


export class ValueClass {
	public amount: number;
	public factoryId: number;
	public classId: number;

	constructor(amount = 0, factoryId = 1, classId = 1) {
		this.amount = amount;
		this.factoryId = factoryId;
		this.classId = classId;
	}

    readPortable(reader: any): void {
        this.amount = reader.readInt('amount');
    }

    writePortable(writer: any): void {
        writer.writeInt('amount', this.amount);
    }

	equals(newValue: ValueClass): boolean {
		return newValue.amount == this.amount;
	}
}

const portableFactory = (classId: number) => {
    if (classId === 1) {
        return new ValueClass();
    }
    return null;
}

export const hazelcast = await Client.newHazelcastClient({
	clusterName: 'dev',
	serialization: {
        portableFactories: {
			// @ts-ignore
            1: portableFactory
        }
    }
});
