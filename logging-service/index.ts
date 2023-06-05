import {app, axios, log, hazelcast, consul} from './core/index.js';

import type {Request, Response, Message} from './typedef.js';


enum ConsulValues {
	MAP = 'message-map',
	QUEUE = 'message-queue'
}

app.get('/', (request: Request, response: Response) => {
	response.send('<h1>Logging Service</h1>');
});

app.get('/message', async (request: Request, response: Response) => {
	log('/message', 'GET');

	const messageMapName = (await consul.kv.get(ConsulValues.MAP) as any)?.Value as string;
	const messageMap = await hazelcast.getMap(messageMapName);

	let concatenatedMessage = '[LOGGING-SERVICE]: ';
	
	for (const [key, value] of await messageMap.entrySet()) {
		concatenatedMessage += ` ${value}`;
	}

	response.json({message: concatenatedMessage});
});

app.post('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'POST', JSON.stringify(request.body));

	const {id, message} = request.body;

	const messageMapName = (await consul.kv.get(ConsulValues.MAP) as any)?.Value as string;
	const messageMap = await hazelcast.getMap(messageMapName);

	await messageMap.put(id, message);

	response.send('Success!');
});

const port = Number(process.env.PORT) || 5000;

app.listen(port, async () => {
	const serviceName = 'logging-service';
	const serviceId = `${serviceName}:${port}`;
	const checkId = `${serviceId}-check`

	console.log(`${serviceName} is running at http://localhost:${port}`);

	await consul.agent.service.register({
		id: serviceId,
		name: serviceName,
		address: 'localhost',
		port,
	});


	await consul.agent.check.register({
		name: `${serviceName}-check`,
		id: checkId,
		serviceid: serviceId,
		ttl: '15s'
	});

	setInterval(() => {
		consul.agent.check.pass(checkId, () => 'Agent alive and reachable');
	}, 5000);
});
