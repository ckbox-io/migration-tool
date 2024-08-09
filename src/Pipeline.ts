/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IUI } from './UI';

export interface ITask<ContextT> {
	readonly processingMessage?: string;

	readonly successMessage?: string;

	readonly failureMessage?: string;

	run( context: ContextT ): Promise<void>;
}

export interface IPipeline<ContextT> {
	run( context: ContextT ): Promise<void>;
}

export default class Pipeline<ContextT> implements IPipeline<ContextT> {
	// TODO: Add logger
	constructor( private _tasks: ITask<ContextT>[], private _ui: IUI ) {}

	public async run( context: ContextT ): Promise<void> {
		for ( const task of this._tasks ) {
			try {
				if ( task.processingMessage ) {
					this._ui.spinner( task.processingMessage );
				}

				await task.run( context );

				if ( task.processingMessage || task.successMessage ) {
					this._ui.succeed( task.successMessage );
				}
			} catch ( error ) {
				if ( task.processingMessage || task.failureMessage ) {
					this._ui.fail( task.failureMessage );
				}

				// TODO: Remove
				console.log( error );

				throw error;
			}
		}
	}
}
