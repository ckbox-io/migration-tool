/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ICKBoxClientManager } from '../CKBoxClientManager';
import { MigratorConfig } from '../Config';
import { IConfigManager } from '../ConfigManager';
import { ITask } from '../Pipeline';

export default class CreateCKBoxClientTask implements ITask {
	public readonly processingMessage: string = 'Creating CKBox client';

	public readonly successMessage: string = 'CKBox client created';

	public readonly failureMessage: string = 'CKBox client creation failed';

	public constructor(
		private readonly _configManager: IConfigManager,
		private readonly _ckboxClientManager: ICKBoxClientManager
	) {}

	public run(): Promise<void> {
		const config: MigratorConfig = this._configManager.getConfig();

		this._ckboxClientManager.createClient( config.ckbox );

		return Promise.resolve();
	}
}
