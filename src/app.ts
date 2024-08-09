/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';

import { AdapterFactory, IAdapterFactory } from './AdapterFactory';
import UI, { IUI } from './UI';
import Logger from './Logger';
import Pipeline, { IPipeline } from './Pipeline';
import LoadConfigTask from './tasks/LoadConfigTask';
import CreateAdapterTask from './tasks/CreateAdapterTask';
import CreateCKBoxClientTask from './tasks/CreateCKBoxClientTask';
import VerifyAdapterConnectionTask from './tasks/VerifyAdapterConnectionTask';
import VerifyCKBoxConnectionTask from './tasks/VerifyCKBoxConnectionTask';
import CreateMigrationPlanTask from './tasks/CreateMigrationPlanTask';
import ConfirmMigrationTask from './tasks/ConfirmMigrationTask';
import MigrateCategoriesTask from './tasks/MigrateCategoriesTask';
import MigratorContext, { IMigratorContext } from './MigratorContext';
import MigrateFoldersTask from './tasks/MigrateFoldersTask';
import MigrateAssetsTask from './tasks/MigrateAssetsTask';

( async () => {
	const logger: Logger = new Logger( 'migrator' );
	const ui: IUI = await UI.create();
	const adapterFactory: IAdapterFactory = new AdapterFactory();

	// TODO: Print migrator version.

	const migrationPipeline: IPipeline<IMigratorContext> = new Pipeline( [
		new LoadConfigTask(),
		new CreateAdapterTask( adapterFactory ),
		new CreateCKBoxClientTask(),
		new VerifyAdapterConnectionTask(),
		new VerifyCKBoxConnectionTask(),
		new CreateMigrationPlanTask(),
		new ConfirmMigrationTask(),
		// TODO: Skip this task when the --dry-run flag is set
		new MigrateCategoriesTask(),
		new MigrateFoldersTask(),
		new MigrateAssetsTask()
	], ui );

	try {
		const context: IMigratorContext = new MigratorContext();

		context.setInstance( ui );
		context.setInstance( logger );

		await migrationPipeline.run( context );

		await logger.removeLogFile();
	} catch ( error ) {
		logger.error( 'Migration failed', error );
		// TODO: Add path to log file.
		ui.fail( `Migration failed. Log written to ${ logger.filename }` );

		process.exit( 1 );
	}

	process.exit( 0 );
} )();
