/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

export interface ITask<ContextT> {
	run( context: ContextT ): Promise<void>;
}

export interface IPipeline<ContextT> {
	addTask( task: ITask<ContextT> ): void;
}

export default class Pipeline<ContextT> implements IPipeline<ContextT> {
	public addTask( task: ITask<ContextT> ): void {
		throw new Error( "Method not implemented." );
	}

	public run( context: ContextT ): Promise<void> {
		throw new Error( "Method not implemented." );
	}
}
