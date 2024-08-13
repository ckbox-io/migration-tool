/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ILogger } from '../Logger';
import { ITask } from '../Pipeline';
import { IUI } from '../UI';

export default class ConfirmMigrationTask implements ITask {
	public constructor( private _dryRun: boolean ) {}

	public async run( ui: IUI, logger: ILogger, abortController: AbortController ): Promise<void> {
		if ( this._dryRun ) {
			logger.warn( 'Dry run migration mode enabled.' );
			ui.warn( 'The migration tool is currently running in dry run mode.' );

			abortController.abort();

			return;
		}

		;

		const answer: string = await ui.prompt( 'Do you want to start the migration? (Y/n) ' );

		if ( answer.toLowerCase() !== 'y' ) {
			abortController.abort();
		}
	}
}
