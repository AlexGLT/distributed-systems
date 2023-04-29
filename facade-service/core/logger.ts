export const log = (endpoint: string, method: string, body?: string): void => {
	const currentTimeStamp = new Date().toLocaleString();

	console.log(
		['[FACADE-SERVICE]', currentTimeStamp, endpoint, method, body]
			.filter(Boolean)
			.join(' | ')
	);
};
