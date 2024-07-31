/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsString, ValidateNested } from 'class-validator';

export class CKFinderInitResponse {
	@ValidateNested()
	@Type( () => CKFinderResourceType )
	@IsDefined()
	public readonly resourceTypes: CKFinderResourceType[];
}

export class CKFinderResourceType {
	@IsString()
	@IsDefined()
	public readonly hash: string;

	@IsString()
	@IsDefined()
	public readonly name: string;

	@IsString()
	@IsDefined()
	public readonly allowedExtensions: string;
}

export class CKFinderGetFoldersResponse {
	@ValidateNested()
	@Type( () => CKFinderCurrentFolder )
	@IsDefined()
	public readonly currentFolder: CKFinderCurrentFolder;

	@ValidateNested( { each: true } )
	@Type( () => CKFinderChildFolder )
	@IsDefined()
	public readonly folders: CKFinderChildFolder[];
}

export class CKFinderCurrentFolder {
	@IsString()
	@IsDefined()
	public readonly path: string;

	@IsString()
	@IsDefined()
	public readonly url: string;
}

export class CKFinderChildFolder {
	@IsString()
	@IsDefined()
	public readonly name: string;

	@IsBoolean()
	@IsDefined()
	public readonly hasChildren: boolean;
}


export class CKFinderGetFilesResponse {
	@ValidateNested()
	@Type( () => CKFinderCurrentFolder )
	@IsDefined()
	public readonly currentFolder: CKFinderCurrentFolder;

	@ValidateNested( { each: true } )
	@Type( () => CKFinderFile )
	@IsDefined()
	public readonly files: CKFinderFile[];
}

export class CKFinderFile {
	@IsString()
	@IsDefined()
	name: string;
}