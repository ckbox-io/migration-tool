/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import 'reflect-metadata';

import { Type } from 'class-transformer';
import { IsDefined, IsString, Length, ValidateNested } from 'class-validator';

export class EasyImageConfig {
	@IsString()
	@IsDefined()
	public readonly serviceOrigin: string;

	@ValidateNested()
	@Type( () => EasyImageCredentialsConfig )
	@IsDefined()
	public readonly accessCredentials: EasyImageCredentialsConfig;
}

export class EasyImageCredentialsConfig {
	@IsString()
	@Length( 20 )
	@IsDefined()
	public readonly environmentId: string;

	@IsString()
	@IsDefined()
	public readonly accessKey: string;
}
