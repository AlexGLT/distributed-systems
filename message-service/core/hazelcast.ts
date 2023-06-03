import {Client} from 'hazelcast-client';


export const hazelcast = await Client.newHazelcastClient({
	clusterName: 'dev'
});
