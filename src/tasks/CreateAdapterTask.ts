/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { formatValidationErrors, MigratorConfig } from '../Config';
import { IConfigManager } from '../ConfigManager';
import { ITask } from '../Pipeline';
import { ISourceStorageAdapter } from '../SourceStorageAdapter';
import { ISourceStorageManager } from '../SourceStorageManager';
import { IUI } from '../UI';

export default class CreateAdapterTask implements ITask {
	public readonly processingMessage: string = 'Creating adapter';

	public readonly successMessage: string = 'Adapter created';

	public readonly failureMessage: string = 'Adapter creation failed';

	public constructor(
		private readonly _configManager: IConfigManager,
		private readonly _sourceStorageManager: ISourceStorageManager
	) {}

	public async run( ui: IUI ): Promise<void> {
		const config: MigratorConfig = this._configManager.getConfig();

		await this._sourceStorageManager.loadAdapter( config.source.type );

		const adapter: ISourceStorageAdapter = this._sourceStorageManager.getAdapter();

		try {
			await adapter.loadConfig( config.source.options );
		} catch ( error ) {
			if ( Array.isArray( error ) ) {
				ui.fail( formatValidationErrors( error ) );
			}

			throw error;
		}
	}
}
