/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { formatValidationErrors } from '../Config';
import { IConfigManager } from '../ConfigManager';
import { ITask } from '../Pipeline';
import { IUI } from '../UI';

export default class LoadConfigTask implements ITask {
	public readonly processingMessage: string = 'Checking configuration';

	public readonly successMessage: string = 'Configuration loaded';

	public readonly failureMessage: string = 'Failed to load configuration';

	public constructor( private readonly _configManager: IConfigManager ) {}

	public async run( ui: IUI ): Promise<void> {
		try {
			await this._configManager.loadConfig();
		} catch ( error ) {
			if ( Array.isArray( error ) ) {
				ui.fail( formatValidationErrors( error ) );
			}

			throw error;
		}
	}
}
