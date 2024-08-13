/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ConfigReader, MigratorConfig } from '../Config';
import { IMigratorContext } from '../MigratorContext';
import { ITask } from '../Pipeline';

export default class LoadConfigTask implements ITask<IMigratorContext> {
	public readonly processingMessage: string = 'Checking configuration';

	public readonly successMessage: string = 'Configuration loaded';

	public readonly failureMessage: string = 'Failed to load configuration';

	public async run( context: IMigratorContext ): Promise<void> {
		// TODO: Print formatted validation errors
		const configReader: ConfigReader = new ConfigReader();
		const config: MigratorConfig = await configReader.read( './config.json' );

		context.setInstance( config );
	}
}
