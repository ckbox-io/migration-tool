/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';

import { Type } from 'class-transformer';
import { IsDefined, IsObject, IsString, ValidateNested } from 'class-validator';

export class CKFinderConfig {
	@IsString()
	@IsDefined()
	public readonly connectorPath: string;

	@ValidateNested()
	@Type(() => CKFinderAuthenticationConfig)
	@IsDefined()
	public readonly authentication: CKFinderAuthenticationConfig;
}

export class CKFinderAuthenticationConfig {
	@IsObject()
	@IsDefined()
	public readonly headers: Record<string, string>;
}
