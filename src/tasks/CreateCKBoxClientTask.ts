/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import CKBoxClient from '../CKBoxClient';
import { MigratorConfig } from '../Config';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';

export default class CreateCKBoxClientTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Creating CKBox client';

	public readonly successMessage: string = 'CKBox client created';

	public readonly failureMessage: string = 'CKBox client creation failed';

	public run( context: MigratorContext ): Promise<void> {
		const config: MigratorConfig = context.getInstance( MigratorConfig );

		const client: CKBoxClient = new CKBoxClient( config.ckbox );

		context.setInstance( client );

		return Promise.resolve();
	}
}
