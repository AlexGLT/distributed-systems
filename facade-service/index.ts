import {v4 as uuid} from 'uuid';
import {app, axios, log, hazelcast, consul} from './core/index.js';

import type {Request, Response, Message} from './typedef.js';


enum Services {
	LOGGING = 'logging-service',
	MESSAGE = 'message-service'
}

enum ConsulValues {
	MAP = 'message-map',
	QUEUE = 'message-queue'
}

app.get('/', (request: Request, response: Response) => {
	response.send('<h1>Facade Service</h1>');
});

app.get('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'GET');

	const loggingServiceInstances = Object.values(await consul.agent.service.list() || [])
		.filter(({Service}) => Service === Services.LOGGING)
		.map(({Address, Port}) => `${Address}:${Port}`);

	const messageServiceInstances = Object.values(await consul.agent.service.list() || [])
		.filter(({Service}) => Service === Services.MESSAGE)
		.map(({Address, Port}) => `${Address}:${Port}`);

	const loggingServiceURL = loggingServiceInstances[Math.floor(Math.random() * loggingServiceInstances.length)];
	const messageServiceURL = messageServiceInstances[Math.floor(Math.random() * messageServiceInstances.length)];

	const loggingServiceResponse = await axios.get(`http://${loggingServiceURL}/message`);
	const messageServiceResponse = await axios.get(`http://${messageServiceURL}/message`);

	console.log('loggingServiceResponse', loggingServiceResponse.data);
	console.log('messageServiceResponse', messageServiceResponse.data);

	const concatenatedResponse = `${loggingServiceResponse.data.message} ${messageServiceResponse.data.message}`;

	response.json({message: concatenatedResponse});
});

app.post('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'POST', JSON.stringify(request.body));
	const message = request.body.message;

	const loggingServiceInstances = Object.values(await consul.agent.service.list() || [])
		.filter(({Service}) => Service === Services.LOGGING)
		.map(({Address, Port}) => `${Address}:${Port}`);

	const loggingServiceURL = loggingServiceInstances[Math.floor(Math.random() * loggingServiceInstances.length)];

	const body = {
		id: uuid(),
		message
	};

	const result = await axios.post(`http://${loggingServiceURL}/message`, body);

	const messageQueueName = (await consul.kv.get(ConsulValues.QUEUE) as any)?.Value as string;
	const messageQueue = await hazelcast.getQueue(messageQueueName);

	await messageQueue.put(message);

	response.send('Success!');
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, async () => {
	const serviceName = 'facade-service';
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
