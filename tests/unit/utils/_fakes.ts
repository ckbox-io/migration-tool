/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IAdapterFactory } from '@src/AdapterFactory';
import { MigratorConfig } from '@src/Config';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { IUI } from '@src/UI';
import { ICKBoxClient } from '@src/CKBoxClient';

import { plainToInstance } from 'class-transformer';
import { ILogger } from '@src/Logger';

export function createUIFake(): IUI {
	return {
		info: () => {},
		warn: () => {},
		spinner: () => {},
		succeed: () => {},
		fail: () => {},
		prompt: () => Promise.resolve( '' ),
		addIndent: () => {},
		clearIndent: () => {}
	};
}

export function createLoggerFake(): ILogger {
	return {
		info: () => {},
		warn: () => {},
		error: () => {}
	};
}

export function createAdapterFactoryFake(): IAdapterFactory {
	return {
		createAdapter: () => Promise.reject( new Error( 'Not implemented' ) )
	};
}

export function createSourceStorageAdapterFake(): ISourceStorageAdapter {
	return {
		name: 'FakeAdapter',
		loadConfig: () => Promise.resolve(),
		verifyConnection: () => Promise.resolve(),
		analyzeStorage: () => Promise.resolve( {
			categories: [],
			assets: []
		} ),
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
		uploadAsset: () => Promise.resolve( '12345678901234567890' )
	};
}
