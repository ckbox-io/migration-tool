/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';

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
	@Length( 20, 20 )
	@IsDefined()
	public readonly environmentId: string;

	@IsString()
	@IsDefined()
	public readonly secret: string;
}

export function formatValidationErrors( validationErrors: ValidationError[], indent?: number ): string {
	let output = '';

	for ( const error of validationErrors ) {
		output += ' '.repeat( ( indent ?? 0 ) * 4 ) + '- ' + chalk.blue.bold( error.property ) + '\n';

		for ( const constraint in error.constraints ?? {} ) {
			output += ' '.repeat( ( ( indent ?? 0 ) + 1 ) * 4 ) +
				chalk.red.bold( constraint ) + ': ' +
				error.constraints![ constraint ] + '\n';
		}

		if ( error.children ) {
			output += formatValidationErrors( error.children, ( indent ?? 0 ) + 1 );
		}
	}

	return output;
}
