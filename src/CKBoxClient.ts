/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import jwt from 'jsonwebtoken';

import { CKBoxConfig } from './Config';
import { blob } from 'node:stream/consumers';

export interface ICKBoxClient {
	verifyConnection(): Promise<void>;

	createCategory( category: ICKBoxCategory ): Promise<string>;

	createFolder( folder: ICKBoxFolder ): Promise<string>;

	uploadAsset( asset: ICKBoxAsset ): Promise<ICKBoxUploadResponse>;
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

export interface ICKBoxAsset {
	name: string;
	location: ICKBoxLocation;
	stream: NodeJS.ReadableStream;
}

export interface ICKBoxUploadResponse {
	id: string;
	url: string;
}

export default class CKBoxClient implements ICKBoxClient {
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

		this._token = jwt.sign( tokenPayload, _config.accessCredentials.accessKey, {
			algorithm: 'HS256'
		} );
	}

	public async verifyConnection(): Promise<void> {
		const response: Response = await fetch(
			`${ this._config.serviceOrigin }/categories`,
			{ headers: { Authorization: this._token } }
		);

		if ( !response.ok ) {
			throw new Error(
				`Failed to connect to the CKBox at ${ this._config.serviceOrigin }.` +
				` Status code: ${ response.status }. ${ await response.text() }`
			);
		}
	}

	public async createCategory( category: ICKBoxCategory ): Promise<string> {
		const response: Response = await this._fetch( 'POST', '/admin/categories', {
			name: category.name,
			extensions: category.allowedExtensions
		} );

		if ( !response.ok ) {
			throw new Error(
				`Failed to create "${ category.name }" category in CKBox. Status code: ${ response.status }. ${ await response.text() }`
			);
		}

		return ( await response.json() as { id: string } ).id;
	}

	public async createFolder( folder: ICKBoxFolder ): Promise<string> {
		const response: Response = await this._fetch( 'POST', '/folders', {
			name: folder.name,
			categoryId: folder.location.categoryId,
			parentId: folder.location.folderId
		} );

		if ( !response.ok ) {
			throw new Error(
				`Failed to create folder in CKBox. Status code: ${ response.status }. ${ await response.text() }`
			);
		}

		return ( await response.json() as { id: string } ).id;
	}

	public async uploadAsset( asset: ICKBoxAsset ): Promise<ICKBoxUploadResponse> {
		const { name: filename, location: target, stream } = asset;

		const formData = new FormData();

		if ( target.categoryId ) {
			formData.append( 'categoryId', target.categoryId );
		}

		if ( target.folderId ) {
			formData.append( 'folderId', target.folderId );
		}

		const blobStream: Blob = await blob( stream );

		formData.append( 'file', blobStream, filename );

		const response: Response = await this._fetch( 'POST', '/assets', formData );

		if ( !response.ok ) {
			throw new Error(
				`Failed to upload asset to CKBox. Status code: ${ response.status }. ${ await response.text() }`
			);
		}

		const responseData: Record<string, string> = await response.json() as Record<string, string>;

		return { id: responseData.id, url: responseData.url };
	}

	private async _fetch(
		method: 'GET' | 'POST' | 'DELETE',
		path: string,
		body?: Record<string, unknown> | FormData
	): Promise<Response> {
		return await fetch(
			`${ this._config.serviceOrigin }${ path }`,
			{
				method,
				body: this._formatBody( body ),
				headers: {
					Authorization: this._token
				}
			}
		);
	}

	private _formatBody( body?: Record<string, unknown> | FormData ): string | FormData | undefined {
		if ( !body ) {
			return undefined;
		}

		if ( body instanceof FormData ) {
			return body;
		}

		return JSON.stringify( body );
	}
}
