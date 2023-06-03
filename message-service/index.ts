import {app, log} from './core';


app.get('/', (request, response) => {
	response.send('<h1>Messages Service</h1>');
});

app.get('/message', (request, response) => {
	log('/message', 'GET');

	response.json({message: '[MESSAGE-SERVICE]: Not implemented yet!'});
});

const port = process.env.PORT || 7000;

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
