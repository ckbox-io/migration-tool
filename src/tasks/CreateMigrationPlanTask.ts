/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceStorageAdapter } from '../SourceStorageAdapter';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';

export default class CreateMigrationPlanTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Creating migration plan';

	public readonly successMessage: string = 'Migration plan created';

	public readonly failureMessage: string = 'Migration plan creation failed';

	public async run( context: MigratorContext ): Promise<void> {
		const adapter: ISourceStorageAdapter = context.getInstance( 'Adapter' );

		const migrationPlan: IMigrationPlan = await adapter.analyzeStorage();

		// TODO: Print migration plan

		context.setInstance( migrationPlan, 'MigrationPlan' );
	}
}
