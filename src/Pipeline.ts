/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IUI } from './UI';

export interface ITask<ContextT> {
	readonly processingMessage?: string;

	readonly successMessage?: string;

	readonly failureMessage?: string;

	run( context: ContextT, abortController: AbortController ): Promise<void>;
}

export interface IPipeline<ContextT> {
	run( context: ContextT ): Promise<void>;
}

export default class Pipeline<ContextT> implements IPipeline<ContextT> {
	// TODO: Add logger
	constructor( private _tasks: ITask<ContextT>[], private _ui: IUI ) {}

	public async run( context: ContextT ): Promise<void> {
		const abortController: AbortController = new AbortController();

		for ( const task of this._tasks ) {
			try {
				if ( task.processingMessage ) {
					this._ui.spinner( task.processingMessage );
				}

				await task.run( context, abortController );

				if ( task.processingMessage || task.successMessage ) {
					this._ui.succeed( task.successMessage );
				}

				if ( abortController.signal.aborted ) {
					this._ui.info( 'Migration aborted' );

					break;
				}
			} catch ( error ) {
				if ( task.processingMessage || task.failureMessage ) {
					this._ui.fail( task.failureMessage );
				}

				throw error;
			}
		}
	}
}
