/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import { ISourceStorageAdapter } from '../SourceStorageAdapter';

export default class VerifyAdapterConnectionTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Verifying connection to source storage';

	public readonly successMessage: string = 'Connection to source storage verified';

	public readonly failureMessage: string = 'Connection to source storage verification failed';

	public async run( context: MigratorContext ): Promise<void> {
		const adapter: ISourceStorageAdapter = context.getInstance( 'Adapter' );

		await adapter.verifyConnection();
	}
}
