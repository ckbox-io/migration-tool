/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import CKBoxClient from '../CKBoxClient';

export default class VerifyCKBoxConnectionTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Verifying connection to CKBox';

	public readonly successMessage: string = 'Connection to CKBox verified';

	public readonly failureMessage: string = 'Connection to CKBox verification failed';

	public async run( context: MigratorContext ): Promise<void> {
		const client: CKBoxClient = context.getInstance( CKBoxClient );

		await client.verifyConnection();
	}
}
