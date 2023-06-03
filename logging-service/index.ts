import {app, axios, log, hazelcast} from './core/index.js';

import type {Request, Response, Message} from './typedef.js';


app.get('/', (request: Request, response: Response) => {
	response.send('<h1>Logging Service</h1>');
});

const messages = await hazelcast.getMap('messages');

app.get('/message', async (request: Request, response: Response) => {
	log('/message', 'GET');

	let concatenatedMessage = '[LOGGING-SERVICE]: ';

	for (const [key, value] of await messages.entrySet()) {
		concatenatedMessage += ` ${value}`;
	}
	
	response.json({message: concatenatedMessage});
});

app.post('/message', async (request: Request<Message>, response: Response) => {
	log('/message', 'POST', JSON.stringify(request.body));

	const {id, message} = request.body;

	await messages.put(id, message);

	response.send('Success!');
});

const port = process.env.PORT || 5000;

app.listen(port, async () => {
	console.log(`logging-service is running at http://localhost:${port}`);
});
