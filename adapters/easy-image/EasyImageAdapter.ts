/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import path, { ParsedPath } from 'node:path';
import { Duplex, PassThrough } from 'node:stream';

import { ISourceStorageAdapter, IMigrationPlan, ISourceAsset, IGetAssetResult, ISourceCategory } from '@ckbox-migrator';

import jwt from 'jsonwebtoken';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import fetch, { Response } from 'node-fetch';
import probeImageSize from 'probe-image-size';

import { EasyImageConfig } from './EasyImageConfig';
import { EasyImageListFilesResponse } from './EasyImageResponses';
import { SUPPORTED_ANIMATIONS_EXTENSIONS, SUPPORTED_IMAGES_EXTENSIONS } from './constants';
import ImagesSizesProvider from './ImagesSizesProvider';


export default class EasyImageAdapter implements ISourceStorageAdapter {
	readonly name: string = 'EasyImage';

	private _config: EasyImageConfig;

	private _token: string;

	private _imagesSizesProvider: ImagesSizesProvider = new ImagesSizesProvider();

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
		const { serviceOrigin } = this._config;

		try {
			await this._fetch( '/list' );
		} catch ( error ) {
			throw new Error(
				`Failed to connect to the EasyImage service at ${ serviceOrigin }.`,
				{ cause: error }
			);
		}
	}

	public async prepareMigrationPlan(): Promise<IMigrationPlan> {
		const listResponse: EasyImageListFilesResponse = await this._fetch( '/list' );

		const categories: ISourceCategory[] = [];
		const assets: ISourceAsset[] = [];

		if ( listResponse.images.length ) {
			categories.push( {
				id: 'images',
				name: 'Images',
				allowedExtensions: SUPPORTED_IMAGES_EXTENSIONS,
				folders: []
			} );

			assets.push( ...this._createAssetsListForCategory( 'images', listResponse.images ) );
		}

		if ( listResponse.animations.length ) {
			categories.push( {
				id: 'animations',
				name: 'Animations',
				allowedExtensions: SUPPORTED_ANIMATIONS_EXTENSIONS,
				folders: []
			} );

			assets.push( ...this._createAssetsListForCategory( 'animations', listResponse.animations ) );
		}

		if ( listResponse.files.length ) {
			categories.push( {
				id: 'files',
				name: 'Files',
				allowedExtensions: this._getFilesExtensions( listResponse.files ),
				folders: []
			} );

			assets.push( ...this._createAssetsListForCategory( 'files', listResponse.files ) );
		}

		return {
			categories,
			assets
		};
	}

	public async getAsset( downloadUrl: string ): Promise<IGetAssetResult> {
		if ( this._isImageUrl( downloadUrl ) ) {
			return this._getImageAssetResult( downloadUrl );
		}

		return {
			stream: await this._fetchStream( downloadUrl ),
			responsiveImages: []
		};
	}

	private async _fetch<T extends object>( path: string ): Promise<T> {
		const response: Response = await fetch(
			`${ this._config.serviceOrigin }${ path }`,
			{
				headers: {
					Authorization: this._token
				}
			}
		);

		if ( !response.ok ) {
			throw new Error(
				`Failed to fetch data from the EasyImage service at ${ this._config.serviceOrigin }. ` +
				`Status code: ${ response.status }. ${ await response.text() }`
			);
		}

		return await response.json();
	}

	private async _fetchStream( downloadUrl: string ): Promise<NodeJS.ReadableStream> {
		const response: Response = await fetch( downloadUrl );

		if ( !response.ok ) {
			throw new Error(
				`Failed to fetch file from the EasyImage service at ${ this._config.serviceOrigin }. ` +
				`Status code: ${ response.status }. ${ await response.text() }`
			);
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

	private _isImageUrl( downloadUrl: string ): boolean {
		const extension: string | undefined = downloadUrl.split( '.' ).pop();

		if ( !extension ) {
			return false;
		}

		return SUPPORTED_IMAGES_EXTENSIONS.includes( extension ) || SUPPORTED_ANIMATIONS_EXTENSIONS.includes( extension );
	}

	private async _getImageAssetResult( downloadUrl: string ): Promise<IGetAssetResult> {
		const { width } = await probeImageSize( downloadUrl );

		return {
			stream: await this._fetchStream( downloadUrl ),
			responsiveImages: this._imagesSizesProvider.getResponsiveWidths( width ).map( width => ( {
				width,
				url: `${ downloadUrl }/${ width }`
			} ) )
		};
	}
}
