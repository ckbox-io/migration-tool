/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';
import fs from 'node:fs/promises';

import {
	Length,
	IsString,
	IsOptional,
	validateOrReject,
	IsObject,
	ValidateNested,
	ValidationError,
	IsDefined
} from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';
import chalk from 'chalk';

export class ConfigReader {
	public async read( path: string ): Promise<MigratorConfig> {
		const fileContent: Buffer = await fs.readFile( path );

		const config: MigratorConfig = plainToInstance( MigratorConfig, JSON.parse( fileContent.toString() ) );

		await validateOrReject( config, { whitelist: true } );

		return config;
	}
}

export class MigratorConfig {
	@ValidateNested()
	@Type( () => SourceConfig )
	@IsDefined()
	public readonly source: SourceConfig;

	@ValidateNested()
	@Type( () => CKBoxConfig )
	@IsDefined()
	public readonly ckbox: CKBoxConfig;
}

export class SourceConfig {
	@IsString()
	@IsDefined()
	public readonly type: string;

	@IsObject()
	@IsDefined()
	public readonly options: Record<string, unknown>;
}

export class CKBoxConfig {
	@IsString()
	@Length( 20, 20 )
	@IsOptional()
	public readonly workspaceId: string;

	@IsString()
	@IsDefined()
	public readonly serviceOrigin: string;

	@ValidateNested()
	@Type( () => CKBoxAccessCredentialsConfig )
	@IsDefined()
	public readonly accessCredentials: CKBoxAccessCredentialsConfig;
}

export class CKBoxAccessCredentialsConfig {
	@IsString()
	@Length( 20 )
	@IsDefined()
	public readonly environmentId: string;

	@IsString()
	@IsDefined()
	public readonly secret: string;
}

// TODO: Move to LoadConfigTask
export function printValidationErrors( validationErrors: ValidationError[], indent?: number ) {
	for ( const error of validationErrors ) {
		console.log( ' '.repeat( ( indent ?? 0 ) * 4 ) + '- ' + chalk.blue.bold( error.property ) );

		for ( const constraint in error.constraints ?? {} ) {
			console.log( ' '.repeat( ( ( indent ?? 0 ) + 1 ) * 4 ) + chalk.red.bold( constraint ) + ': ' + error.constraints![ constraint ] );
		}

		if ( error.children ) {
			printValidationErrors( error.children, ( indent ?? 0 ) + 1 );
		}
	}
}
