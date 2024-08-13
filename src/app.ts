/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';

import fs from 'node:fs/promises';
import path from 'node:path';

import UI, { IUI } from './UI';
import Logger from './Logger';
import Pipeline, { IPipeline } from './Pipeline';
import MigratedCategoriesRepository, { IMigratedCategoriesRepository } from './repositories/MigratedCategoriesRepository';
import MigratedFoldersRepository, { IMigratedFoldersRepository } from './repositories/MigratedFoldersRepository';
import URLMappingWriter from './URLMappingWriter';
import ConfigManager, { IConfigManager } from './ConfigManager';
import SourceStorageManager, { ISourceStorageManager } from './SourceStorageManager';
import CKBoxClientManager, { ICKBoxClientManager } from './CKBoxClientManager';
import MigrationPlanManager, { IMigrationPlanManager } from './MigrationPlanManager';

import LoadConfigTask from './tasks/LoadConfigTask';
import CreateAdapterTask from './tasks/CreateAdapterTask';
import CreateCKBoxClientTask from './tasks/CreateCKBoxClientTask';
import VerifyAdapterConnectionTask from './tasks/VerifyAdapterConnectionTask';
import VerifyCKBoxConnectionTask from './tasks/VerifyCKBoxConnectionTask';
import CreateMigrationPlanTask from './tasks/CreateMigrationPlanTask';
import ConfirmMigrationTask from './tasks/ConfirmMigrationTask';
import MigrateCategoriesTask from './tasks/MigrateCategoriesTask';
import MigrateFoldersTask from './tasks/MigrateFoldersTask';
import MigrateAssetsTask from './tasks/MigrateAssetsTask';

( async () => {
	const logger: Logger = new Logger( 'migrator' );
	const ui: IUI = await UI.create();
	const urlMappingWriter: URLMappingWriter = new URLMappingWriter();

	const stopHandler = () => ui.stop();
	const unhandledRejectionHandler = ( reason: Error ) => {
		logger.error( 'Unhandled exception', reason );
	};

	process.on( 'unhandledRejection', unhandledRejectionHandler );
	process.on( 'uncaughtException', unhandledRejectionHandler );
	process.on( 'SIGINT', stopHandler );
	process.on( 'SIGTERM', stopHandler );

	const migratedCategoriesRepository: IMigratedCategoriesRepository = new MigratedCategoriesRepository();
	const migratedFoldersRepository: IMigratedFoldersRepository = new MigratedFoldersRepository();

	const configManager: IConfigManager = new ConfigManager();
	const sourceStorageManager: ISourceStorageManager = new SourceStorageManager();
	const ckboxClientManager: ICKBoxClientManager = new CKBoxClientManager();
	const migrationPlanManager: IMigrationPlanManager = new MigrationPlanManager();

	const args: string[] = process.argv.slice( 2 );
	const dryRun: boolean = args.includes( '--dry-run' );

	const version: string = await getVersion();

	ui.info( `CKBox migrator v${ version }` );
	logger.info( 'CKBox migrator started', { version } );

	const migrationPipeline: IPipeline = new Pipeline( [
		new LoadConfigTask( configManager ),
		new CreateAdapterTask( configManager, sourceStorageManager ),
		new CreateCKBoxClientTask( configManager, ckboxClientManager ),
		new VerifyAdapterConnectionTask( sourceStorageManager ),
		new VerifyCKBoxConnectionTask( ckboxClientManager ),
		new CreateMigrationPlanTask( migrationPlanManager, sourceStorageManager, urlMappingWriter.filename ),
		new ConfirmMigrationTask( dryRun ),
		new MigrateCategoriesTask( migrationPlanManager, ckboxClientManager, migratedCategoriesRepository ),
		new MigrateFoldersTask( migrationPlanManager, ckboxClientManager, migratedCategoriesRepository, migratedFoldersRepository ),
		new MigrateAssetsTask(
			migrationPlanManager,
			sourceStorageManager,
			ckboxClientManager,
			urlMappingWriter,
			migratedCategoriesRepository,
			migratedFoldersRepository
		)
	], ui, logger );

	try {
		await migrationPipeline.run();

		await logger.removeLogFile();
	} catch ( error ) {
		logger.error( 'Migration failed', error );
		ui.fail( `Migration failed. Log written to ${ logger.filename }` );

		process.exit( 1 );
	}

	process.exit( 0 );
} )();

async function getVersion(): Promise<string> {
	const packageJson: string = await fs.readFile( path.join( __dirname, '../package.json' ), 'utf8' );

	return JSON.parse( packageJson ).version;
}
