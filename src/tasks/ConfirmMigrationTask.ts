/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ILogger } from '../Logger';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import { IUI } from '../UI';

export default class ConfirmMigrationTask implements ITask<MigratorContext> {
	public async run( context: MigratorContext, ui: IUI, logger: ILogger, abortController: AbortController ): Promise<void> {
		const answer: string = await ui.prompt( 'Do you want to start the migration? (Y/n) ' );

		if ( answer.toLowerCase() !== 'y' ) {
			abortController.abort();
		}
	}
}
