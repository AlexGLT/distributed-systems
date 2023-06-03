import { v4 as uuid } from 'uuid';
import {app, axios, log} from './core';

import type {Request, Response, Message} from './typedef';


app.get('/', (request: Request, response: Response) => {
	response.send('<h1>Facade Service</h1>');
});

const LOGGING_INSTANCES = [5001, 5002, 5003];

app.get('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'GET');

	const loggingServiceResponse = await axios.get('http://localhost:5001/message'`);
	const messageServiceResponse = await axios.get('http://localhost:7000/message');

	console.log('loggingServiceResponse', loggingServiceResponse.data);
	console.log('messageServiceResponse', messageServiceResponse.data);

	const concatenatedResponse = `${loggingServiceResponse.data.message} ${messageServiceResponse.data.message}`;

	response.json({message: concatenatedResponse});
});

app.post('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'POST', JSON.stringify(request.body));

	const loggingPort = LOGGING_INSTANCES[Math.floor(Math.random() * LOGGING_INSTANCES.length)];

	const body = {
		id: uuid(),
		message: request.body.message || ''
	};

	const result = await axios.post(`http://localhost:${loggingPort}/message`, body);

	response.send('Success!');
});

const port = process.env.PORT || '3000';

app.listen(port, () => {
	console.log(`facade-service is running at http://localhost:${port}`);
});
