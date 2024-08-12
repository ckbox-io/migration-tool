/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ILogger } from './Logger';
import { IUI } from './UI';

export interface ITask<ContextT> {
	readonly processingMessage?: string;

	readonly successMessage?: string;

	readonly failureMessage?: string;

	run( context: ContextT, ui: IUI, logger: ILogger, abortController: AbortController ): Promise<void>;
}

export interface IPipeline<ContextT> {
	run( context: ContextT ): Promise<void>;
}

export default class Pipeline<ContextT> implements IPipeline<ContextT> {
	constructor( private _tasks: ITask<ContextT>[], private _ui: IUI, private _logger: ILogger ) {}

	public async run( context: ContextT ): Promise<void> {
		const abortController: AbortController = new AbortController();

		for ( const task of this._tasks ) {
			try {
				const taskName: string = task.constructor.name;

				this._logger.info( 'Processing task', { taskName } );

				if ( task.processingMessage ) {
					this._ui.spinner( task.processingMessage );
				}

				await task.run( context, this._ui, this._logger.child( taskName ), abortController );

				if ( task.processingMessage || task.successMessage ) {
					this._ui.succeed( task.successMessage );
				}

				if ( abortController.signal.aborted ) {
					this._logger.info( 'Migration aborted' );
					this._ui.info( 'Migration aborted' );

					break;
				}
			} catch ( error ) {
				this._logger.error( 'Task failed', { error } );

				if ( task.processingMessage || task.failureMessage ) {
					this._ui.fail( task.failureMessage );
				}

				throw error;
			}
		}
	}
}
