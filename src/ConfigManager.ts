/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import fs from 'node:fs/promises';

import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { MigratorConfig } from './Config';

export interface IConfigManager {
	loadConfig(): Promise<void>;

	getConfig(): MigratorConfig;
}

export default class ConfigManager implements IConfigManager {
	private _config: MigratorConfig | undefined;

	public async loadConfig(): Promise<void> {
		const path: string = './config.json';

		const fileContent: Buffer = await fs.readFile( path );

		this._config = plainToInstance( MigratorConfig, JSON.parse( fileContent.toString() ) );

		await validateOrReject( this._config, { whitelist: true } );
	}

	public getConfig(): MigratorConfig {
		if ( !this._config ) {
			throw new Error( 'Config not loaded.' );
		}

		return this._config;
	}
}
