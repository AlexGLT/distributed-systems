import type {Request as DefaultRequest} from 'express';
export type {Response} from 'express';

export interface Request<T = {}> extends DefaultRequest {
	body: T
}

export type Message = {
	message: string,
};
