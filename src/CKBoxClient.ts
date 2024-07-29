/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import jwt from 'jsonwebtoken';

import { CKBoxConfig } from './Config';

export interface ICBoxClient {
	verifyConnection(): Promise<void>;

	createCategory( category: ICKBoxCategory ): Promise<string>;

	createFolder( folder: ICKBoxFolder ): Promise<string>;

	uploadAsset( location: ICKBoxLocation, stream: NodeJS.ReadableStream ): Promise<string>;
}

export interface ICKBoxCategory {
	name: string;
	allowedExtensions: string[];
}

export interface ICKBoxFolder {
	name: string;
	location: ICKBoxLocation;
}

export interface ICKBoxLocation {
	categoryId?: string;
	folderId?: string;
}

export default class CKBoxClient implements ICBoxClient {
	private _token: string;

	public constructor( private _config: CKBoxConfig ) {
		const tokenPayload: Record<string, unknown> = {
			iss: 'ckbox-migrator',
			aud: _config.accessCredentials.environmentId,
			sub: 'ckbox-migrator',
			auth: {
				ckbox: {
					role: 'admin',
					...( _config.workspaceId ? { workspaces: [ _config.workspaceId ] } : {} )
				}
			}
		};

		this._token = jwt.sign( tokenPayload, _config.accessCredentials.secret, {
			algorithm: 'HS256'
		} );
	}

	public async verifyConnection(): Promise<void> {
		// TODO: Check a different endpoint to verify workspace connection.
		const response: Response = await fetch(
			`${ this._config.serviceOrigin }/categories`,
			{ headers: { Authorization: this._token } }
		);

		if ( !response.ok ) {
			throw new Error(
				`Failed to connect to the CKBox at ${ this._config.serviceOrigin }.` +
				`Status code: ${ response.status }. ${ await response.text() }`
			);
		}
	}

	public async createCategory( category: ICKBoxCategory ): Promise<string> {
		throw new Error( 'TODO: Not implemented' );
	}

	public async createFolder( folder: ICKBoxFolder ): Promise<string> {
		throw new Error( 'TODO: Not implemented' );
	}

	public async  uploadAsset( target: ICKBoxLocation, stream: NodeJS.ReadableStream ): Promise<string> {
		throw new Error( 'TODO: Not implemented' );
	}
}
