import {app, axios, log, hazelcast, ValueClass} from './core/index.js';

import type {Request, Response, Message} from './typedef.js';


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

const port = process.env.PORT || 5000;

app.listen(port, async () => {
	console.log(`Server is running at http://localhost:${port}`);

	/* Remove map */
	// (await hazelcast.getMap('my-distributed-map')).destroy();

	/* Check distribution */
	// const map = await hazelcast.getMap('my-distributed-map');

	// for (let i = 0; i < 1000; i++) {
	// 	await map.put(`key-${i}`, `value-${i}`);
	// }

	/* Without locking */
	// const map = await hazelcast.getMap('map');
	// const key = '1';
	// await map.put(key, new ValueClass());

	// console.log('Starting');

	// for(let i = 0; i < 1000; i++){
	// 	const value = await map.get(key) as ValueClass;
	// 	value.amount++;
	// 	await map.put(key, value);
	// }

	// console.log('Finished! Result = ', (await map.get(key) as ValueClass).amount);
	
	/* With pessimistic locking */
	// const map = await hazelcast.getMap('map');
	// const key = '1';
	// await map.put(key, new ValueClass());

	// console.log('Starting');

	// for(let i = 0; i < 1000; i++){
	// 	await map.lock(key);

	// 	const value = await map.get(key) as ValueClass;
	// 	value.amount++;
	// 	await map.put(key, value);

	// 	await map.unlock(key);
	// }

	// console.log('Finished! Result = ', (await map.get(key) as ValueClass).amount);

	// setTimeout(async () => {
	// 	console.log('Timeout result = ', (await map.get(key) as ValueClass).amount);
	// }, 2000);

	/* With optimistic locking */
	// const map = await hazelcast.getMap('map');
	// const key = '1';
	// await map.put(key, new ValueClass());

	// console.log('Starting');

	// for(let i = 0; i < 1000; i++){
	// 	while (true) {
	// 		const oldValue = await map.get(key) as ValueClass;
	// 		const newValue = {...oldValue};
	
	// 		newValue.amount++;

	// 		if (await map.replaceIfSame(key, oldValue, newValue)) {
	// 			break
	// 		};
	// 	}
	// }

	// console.log('Finished! Result = ', (await map.get(key) as ValueClass).amount);

	// setTimeout(async () => {
	// 	console.log('Timeout result = ', (await map.get(key) as ValueClass).amount);
	// }, 2000);

	/* Queue */
	const queue = await hazelcast.getQueue('queue');

	if (port === '5001') {
		for (let k = 0; k < 20; k++) {
			await queue.put(k);
			console.log('Producing: ' + k);
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
		}
		await queue.put(-1);
	} else {
		while(true) {
			const item = await queue.take();

			console.log('Consumed item: ' + item);

			if (item === -1) {
				await queue.put(-1);
				break;
			}

			await new Promise((resolve) => {
				setTimeout(resolve, 2000);
			});
		}
	}
});
