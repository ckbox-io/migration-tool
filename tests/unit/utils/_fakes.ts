/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { MigratorConfig } from '@src/Config';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { IUI } from '@src/UI';
import { ICKBoxClient } from '@src/CKBoxClient';

import { plainToInstance } from 'class-transformer';
import { ILogger } from '@src/Logger';
import MigrationPlan from '@src/MigrationPlan';
import { IURLMappingWriter } from '@src/URLMappingWriter';
import { IMigratedCategoriesRepository } from '@src/repositories/MigratedCategoriesRepository';
import { IMigratedFoldersRepository } from '@src/repositories/MigratedFoldersRepository';
import { ICKBoxClientManager } from '@src/CKBoxClientManager';
import { IMigrationPlanManager } from '@src/MigrationPlanManager';
import { IConfigManager } from '@src/ConfigManager';
import { ISourceStorageManager } from '@src/SourceStorageManager';

export function createUIFake(): IUI {
	return {
		info: () => {},
		warn: () => {},
		spinner: () => {},
		succeed: () => {},
		fail: () => {},
		prompt: () => Promise.resolve( '' ),
		addIndent: () => {},
		clearIndent: () => {},
		stop: () => {}
	};
}

export function createLoggerFake(): ILogger {
	return {
		info: () => {},
		warn: () => {},
		error: () => {},
		child: () => createLoggerFake()
	};
}

export function createSourceStorageAdapterFake(): ISourceStorageAdapter {
	return {
		name: 'FakeAdapter',
		loadConfig: () => Promise.resolve(),
		verifyConnection: () => Promise.resolve(),
		prepareMigrationPlan: () => Promise.resolve( new MigrationPlan( [], [] ) ),
		getAsset: () => Promise.reject( new Error( 'Not implemented' ) )
	};
}

export function createMigratorConfigFake( adapterConfig: Record<string, unknown> = {} ): MigratorConfig {
	return plainToInstance( MigratorConfig, {
		source: {
			type: 'FakeAdapter',
			options: adapterConfig
		},
		ckbox: {
			workspaceId: '12345678901234567890',
			serviceOrigin: 'http://localhost:8080',
			accessCredentials: {
				environmentId: '12345678901234567890',
				secret: '12345678901234567890'
			}
		}
	} );
}

export function createCKBoxClientFake(): ICKBoxClient {
	return {
		verifyConnection: () => Promise.resolve(),
		createCategory: () => Promise.resolve( '12345678901234567890' ),
		createFolder: () => Promise.resolve( '12345678901234567890' ),
		uploadAsset: () => Promise.resolve( {
			id: '12345678901234567890',
			url: 'http://localhost:8080/asset/12345678901234567890'
		} )
	};
}

export function createURLMappingWriterFake(): IURLMappingWriter {
	return {
		write: () => {}
	};
}

export function createMigratedCategoriesRepositoryFake(): IMigratedCategoriesRepository {
	return {
		addMigratedCategory: () => {},
		getIdOfMigratedCategory: () => 'migrated-category-id-c-1'
	};
}

export function createMigratedFoldersRepositoryFake(): IMigratedFoldersRepository {
	return {
		addMigratedFolder: () => {},
		getIdOfMigratedFolder: () => 'migrated-folder-id-f-1'
	};
}

export function createConfigManagerFake( config?: MigratorConfig ): IConfigManager {
	return {
		loadConfig: () => Promise.resolve(),
		getConfig: () => config ?? createMigratorConfigFake()
	};
}

export function createSourceStorageManagerFake( adapter?: ISourceStorageAdapter ): ISourceStorageManager {
	return {
		loadAdapter: () => Promise.resolve(),
		getAdapter: () => adapter ?? createSourceStorageAdapterFake()
	};
}

export function createCKBoxClientManagerFake( client?: ICKBoxClient ): ICKBoxClientManager {
	return {
		createClient: () => {},
		getClient: () => client ?? createCKBoxClientFake()
	};
}

export function createMigrationPlanManagerFake( migrationPlan?: MigrationPlan ): IMigrationPlanManager {
	return {
		createMigrationPlan: () => {},
		getMigrationPlan: () => migrationPlan ?? new MigrationPlan( [], [] )
	};
}
