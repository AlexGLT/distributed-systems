import { v4 as uuid } from 'uuid';
import {app, axios, log, hazelcast} from './core/index.js';

import type {Request, Response, Message} from './typedef.js';


app.get('/', (request: Request, response: Response) => {
	response.send('<h1>Facade Service</h1>');
});

const LOGGING_INSTANCES = [5001, 5002, 5003];
const MESSAGE_INSTANCES = [7001, 7002];

const messageQueue = await hazelcast.getQueue('messages');

app.get('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'GET');

	const messagePort = MESSAGE_INSTANCES[Math.floor(Math.random() * MESSAGE_INSTANCES.length)];

	const loggingServiceResponse = await axios.get('http://localhost:5001/message');
	const messageServiceResponse = await axios.get(`http://localhost:${messagePort}/message`);

	console.log('loggingServiceResponse', loggingServiceResponse.data);
	console.log('messageServiceResponse', messageServiceResponse.data);

	const concatenatedResponse = `${loggingServiceResponse.data.message} ${messageServiceResponse.data.message}`;

	response.json({message: concatenatedResponse});
});

app.post('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'POST', JSON.stringify(request.body));
	const message = request.body.message;

	const loggingPort = LOGGING_INSTANCES[Math.floor(Math.random() * LOGGING_INSTANCES.length)];

	const body = {
		id: uuid(),
		message
	};

	const result = await axios.post(`http://localhost:${loggingPort}/message`, body);
	await messageQueue.put(message);

	response.send('Success!');
});

const port = process.env.PORT || '3000';

app.listen(port, () => {
	console.log(`facade-service is running at http://localhost:${port}`);
});
