/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import path, { ParsedPath } from 'node:path';

import { ISourceStorageAdapter, IMigrationPlan, ISourceAsset } from '@ckbox-migrator';

import jwt from 'jsonwebtoken';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import fetch, { Response } from 'node-fetch';

import { EasyImageConfig } from './EasyImageConfig';
import { EasyImageListFilesResponse } from './EasyImageResponses';
import { SUPPORTED_ANIMATIONS_EXTENSIONS, SUPPORTED_IMAGES_EXTENSIONS } from './constants';

export default class EasyImageAdapter implements ISourceStorageAdapter {
	readonly name: string = 'EasyImage';

	private _config: EasyImageConfig;

	private _token: string;

	public async loadConfig( plainConfig: Record<string, unknown> ): Promise<void> {
		this._config = plainToInstance( EasyImageConfig, plainConfig );

		await validateOrReject( this._config );

		const tokenPayload: Record<string, unknown> = {
			iss: 'ckbox-migrator',
			aud: this._config.accessCredentials.environmentId,
			sub: 'ckbox-migrator'
		};

		this._token = jwt.sign( tokenPayload, this._config.accessCredentials.accessKey, {
			algorithm: 'HS256'
		} );
	}

	public async verifyConnection(): Promise<void> {
		const response: Response = await fetch( `${ this._config.serviceOrigin }/list` );

		if ( !response.ok ) {
			throw new Error( `Failed to connect to the EasyImage service at ${ this._config.serviceOrigin }.` );
		}
	}

	public async prepareMigrationPlan(): Promise<IMigrationPlan> {
		const listResponse: EasyImageListFilesResponse = await this._fetch( '/list' );

		return {
			categories: [
				{
					id: 'images',
					name: 'Images',
					allowedExtensions: SUPPORTED_IMAGES_EXTENSIONS,
					folders: []
				},
				{
					id: 'animations',
					name: 'Animations',
					allowedExtensions: SUPPORTED_ANIMATIONS_EXTENSIONS,
					folders: []
				},
				{
					id: 'files',
					name: 'Files',
					allowedExtensions: this._getFilesExtensions( listResponse.files ),
					folders: []
				}
			],
			assets: [
				...this._createAssetsListForCategory( 'images', listResponse.images ),
				...this._createAssetsListForCategory( 'animations', listResponse.animations ),
				...this._createAssetsListForCategory( 'files', listResponse.files )
			]
		};
	}

	public async getAsset( downloadUrl: string ): Promise<NodeJS.ReadableStream> {
		return await this._fetchStream( downloadUrl );
	}

	private async _fetch( path: string ): Promise<any> {
		const response: Response = await fetch(
			`${ this._config.serviceOrigin }${ path }`,
			{
				headers: {
					Authorization: this._token
				}
			}
		);

		if ( !response.ok ) {
			throw new Error( `Failed to fetch data from the EasyImage service at ${ this._config.serviceOrigin }.` );
		}

		return await response.json();
	}

	private async _fetchStream( downloadUrl: string ): Promise<NodeJS.ReadableStream> {
		const response: Response = await fetch( downloadUrl );

		if ( !response.ok ) {
			throw new Error( `Failed to fetch data from the EasyImage service at ${ this._config.serviceOrigin }.` );
		}

		return response.body;
	}

	private _createAssetsListForCategory( categoryId: string, filesURLs: string[] ): ISourceAsset[] {
		return filesURLs.map( fileURL => {
			const filePath: string = new URL( fileURL ).pathname;
			const parsedPath: ParsedPath = path.parse( filePath );

			return {
				id: fileURL,
				downloadUrl: fileURL,
				name: parsedPath.name,
				extension: parsedPath.ext.substring( 1 ),
				location: {
					categoryId
				},
				downloadUrlToReplace: fileURL
			};
		} );

	}

	private _getFilesExtensions( files: string[] ): string[] {
		return [ ...new Set(
			files.map( fileName => {
				const extension = fileName.split( '.' ).pop();

				return extension ? extension.toLowerCase() : '';
			}
		) ) ];
	}
}
