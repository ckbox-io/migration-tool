/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ITask } from '../Pipeline';
import { ICKBoxClient } from '../CKBoxClient';
import { ICKBoxClientManager } from '../CKBoxClientManager';

export default class VerifyCKBoxConnectionTask implements ITask {
	public readonly processingMessage: string = 'Verifying connection to CKBox';

	public readonly successMessage: string = 'Connection to CKBox verified';

	public readonly failureMessage: string = 'Connection to CKBox verification failed';

	public constructor( private _ckboxClientManager: ICKBoxClientManager ) {}

	public async run(): Promise<void> {
		const client: ICKBoxClient = this._ckboxClientManager.getClient();

		await client.verifyConnection();
	}
}
