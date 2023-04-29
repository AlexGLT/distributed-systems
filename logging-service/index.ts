import {app, axios, log} from './core';

import type {Request, Response, Message} from './typedef';


app.get('/', (request: Request, response: Response) => {
	response.send('<h1>Logging Service</h1>');
});

const messages: Record<string, string> = {};

app.get('/message', async (request: Request, response: Response) => {
	log('/message', 'GET');

	const concatenatedMessage = Object.values(messages).reduce((acc, message) => `${acc} ${message}`, '[LOGGING-SERVICE]: ');
	
	response.json({message: concatenatedMessage});
});

app.post('/message', (request: Request<Message>, response: Response) => {
	log('/message', 'POST', JSON.stringify(request.body));

	const {id, message} = request.body;

	messages[id] = message;

	response.send('Success!');
});

const port = process.env.PORT || 3003;

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
