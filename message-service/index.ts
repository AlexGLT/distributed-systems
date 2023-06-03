import {app, log, hazelcast} from './core/index.js';


app.get('/', (request, response) => {
	response.send('<h1>Messages Service</h1>');
});

const messageQueue = await hazelcast.getQueue('messages');

const messages: Array<string> = [];

app.get('/message', async (request, response) => {
	const lastMessage = await messageQueue.take() as string;	

	log('/message', 'GET', `TAKEN MESSAGE FROM QUEUE: ${lastMessage}`);
	messages.push(lastMessage);

	let concatenatedMessage = '[MESSAGE-SERVICE]: ';

	for (const message of messages) {
		concatenatedMessage += ` ${message}`;
	}

	response.json({message: concatenatedMessage});
});

const port = process.env.PORT || 7000;

app.listen(port, () => {
	console.log(`message-service is running at http://localhost:${port}`);
});
