/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import UI, { IUI } from '../UI';

export default class ConfirmMigrationTask implements ITask<MigratorContext> {
	public async run( context: MigratorContext, abortController: AbortController ): Promise<void> {
		const ui: IUI = context.getInstance( UI );

		const answer: string = await ui.prompt( 'Do you want to start the migration? (Y/n) ' );

		if ( answer.toLowerCase() !== 'y' ) {
			abortController.abort();
		}
	}
}
