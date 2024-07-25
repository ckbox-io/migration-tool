/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';
import { ConfigReader, MigratorConfig, printValidationErrors } from './Config';
import { AdapterFactory, IAdapterFactory } from './AdapterFactory';
import UI, { IUI } from './UI';
import { ISourceStorageAdapter } from './SourceStorageAdapter';
import Logger, { ILogger } from './Logger';

( async () => {
	const logger: ILogger = new Logger( 'migrator' );

	const ui: IUI = await UI.create();
	const adapterFactory: IAdapterFactory = new AdapterFactory();

	try {
		logger.info( 'Checking configuration', { filename: './config.json' } );
		ui.spinner( 'Checking configuration' );

		const configReader: ConfigReader = new ConfigReader();
		const config: MigratorConfig = await configReader.read( './config.json' );

		logger.info( 'Config loaded successfully' );
		ui.succeed( 'Config loaded successfully' );

		logger.info( 'Creating adapter', { adapter: config.source.type } );

		const adapter: ISourceStorageAdapter = await adapterFactory.createAdapter( config.source.type );

		await adapter.loadConfig( config.source.options );

		logger.info( 'Adapter created' );

		logger.info( 'Checking connection to source storage', { adapter: config.source.type } );
		ui.spinner( `Checking connection to source storage (${ adapter.name })` );

		await adapter.verifyConnection();

		logger.info( 'Checking connection to source storage completed' );
		ui.succeed();

		logger.info( 'Analyzing source storage' );
		ui.spinner( 'Analyzing source storage' );

		const migrationPlan = await adapter.analyzeStorage();

		logger.info( 'Storage analyzed' );
		ui.succeed();

		console.dir( migrationPlan, { depth: null } );
	} catch ( error ) {
		ui.fail( 'Configuration is incorrect' );

		if ( Array.isArray( error ) ) {
			printValidationErrors( error );

			process.exit( 1 );
		}

		console.error( error );

		process.exit( 1 );
	}
} )();
