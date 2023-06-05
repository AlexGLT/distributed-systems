import {app, log, hazelcast, consul} from './core/index.js';


app.get('/', (request, response) => {
	response.send('<h1>Messages Service</h1>');
});

enum ConsulValues {
	MAP = 'message-map',
	QUEUE = 'message-queue'
}

const messages: Array<string> = [];

app.get('/message', async (request, response) => {
	const messageQueueName = (await consul.kv.get(ConsulValues.QUEUE) as any)?.Value as string;
	const messageQueue = await hazelcast.getQueue(messageQueueName);

	const lastMessage = await messageQueue.take() as string;	
	log('/message', 'GET', `TAKEN MESSAGE FROM QUEUE: ${lastMessage}`);

	messages.push(lastMessage);

	let concatenatedMessage = '[MESSAGE-SERVICE]: ';

	for (const message of messages) {
		concatenatedMessage += ` ${message}`;
	}

	response.json({message: concatenatedMessage});
});

const port = Number(process.env.PORT) || 7000;

app.listen(port, async () => {
	const serviceName = 'message-service';
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
