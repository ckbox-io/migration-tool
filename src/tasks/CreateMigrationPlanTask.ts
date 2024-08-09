/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceStorageAdapter } from '../SourceStorageAdapter';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import MigrationPlan from '../MigrationPlan';

export default class CreateMigrationPlanTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Creating migration plan';

	public readonly successMessage: string = 'Migration plan created';

	public readonly failureMessage: string = 'Migration plan creation failed';

	public async run( context: MigratorContext ): Promise<void> {
		const adapter: ISourceStorageAdapter = context.getInstance( 'Adapter' );

		const { categories, assets } = await adapter.prepareMigrationPlan();

		// TODO: Print migration plan summary.
		// This tool will migrate files from the source storage using following steps:
		// - create asset categories in CKBox (3 categories will be created: Files, Images, FooBar)
		// - copy folder structure to CKBox (189 folders will be created)
		// - copy files to CKBox (28890 files will be copied)
		// - save the map of old and new file URLs
		//   (the map will be saved in /some/path/ckbox_mapped_URLs_18.07.2024_09.16.txt)

		context.setInstance( new MigrationPlan( categories, assets ) );
	}
}
