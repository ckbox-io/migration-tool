/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ITask } from '../Pipeline';
import { ISourceStorageAdapter } from '../SourceStorageAdapter';
import { ISourceStorageManager } from '../SourceStorageManager';

export default class VerifyAdapterConnectionTask implements ITask {
	public readonly processingMessage: string = 'Verifying connection to source storage';

	public readonly successMessage: string = 'Connection to source storage verified';

	public readonly failureMessage: string = 'Connection to source storage verification failed';

	public constructor( private _sourceStorageManager: ISourceStorageManager ) {}

	public async run(): Promise<void> {
		const adapter: ISourceStorageAdapter = this._sourceStorageManager.getAdapter();

		await adapter.verifyConnection();
	}
}
