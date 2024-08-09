/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ISourceStorageAdapter, IMigrationPlan, ISourceCategory, ISourceFolder, ISourceAsset } from '@ckbox-migrator';

import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import fetch, { Response } from 'node-fetch';

import { CKFinderConfig } from './CKFinderConfig';
import { CKFinderGetFilesResponse, CKFinderGetFoldersResponse, CKFinderInitResponse } from './CKFinderResponses';
import path, { ParsedPath } from 'path';

export default class CKFinderAdapter implements ISourceStorageAdapter {
	readonly name: string = 'CKFinder';

	private _config: CKFinderConfig;

	public async loadConfig( plainConfig: Record<string, unknown> ): Promise<void> {
		this._config = plainToInstance( CKFinderConfig, plainConfig );

		await validateOrReject( this._config );
	}

	public async verifyConnection(): Promise<void> {
		const response: Response = await fetch(
			`${ this._config.connectorPath }?command=Init`,
			{ headers: this._config.authentication.headers }
		);

		if ( !response.ok ) {
			throw new Error( `Failed to connect to the CKFinder connector at ${this._config.connectorPath}.` );
		}
	}

	public async prepareMigrationPlan(): Promise<IMigrationPlan> {
		const categories: ISourceCategory[] = await this._getCategories();
		const assets: ISourceAsset[] = await this._getAssets( categories );

		return {
			categories,
			assets
		};
	}

	public async getAsset( downloadUrl: string ): Promise<NodeJS.ReadableStream> {
		return await this._fetchStream( downloadUrl );
	}

	private async _getCategories(): Promise<ISourceCategory[]> {
		const categoriesResponse: CKFinderInitResponse = await this._fetch(
			{ command: 'Init' },
			CKFinderInitResponse
		);

		return await this._promiseMap( categoriesResponse.resourceTypes, async resourceType => ( {
			id: resourceType.name,
			name: resourceType.name,
			allowedExtensions: resourceType.allowedExtensions.split( ',' ),
			folders: ( await this._getFolder( resourceType.name, '' ) ).childFolders
		} ) );
	}

	private async _getFolder( type: string, currentFolder: string ): Promise<ISourceFolder> {
		const foldersResponse: CKFinderGetFoldersResponse = await this._fetch(
			{ command: 'GetFolders', type, currentFolder },
			CKFinderGetFoldersResponse
		);

		const name: string = path.basename( foldersResponse.currentFolder.path );

		const childFolders: ISourceFolder[] = await this._promiseMap( foldersResponse.folders, async folder => {
			return await this._getFolder( type, path.join( currentFolder, folder.name ) );
		} );

		return {
			id: foldersResponse.currentFolder.path,
			name,
			childFolders
		}
	}

	private async _getAssets( categories: ISourceCategory[] ): Promise<ISourceAsset[]> {
		const assets: ISourceAsset[] = [];

		for ( const category of categories ) {
			assets.push( ...( await this._getAssetsForCategory( category ) ) );
		}

		return assets;
	}

	private async _getAssetsForCategory( category: ISourceCategory ): Promise<ISourceAsset[]> {
		const assets: ISourceAsset[] = [];

		assets.push( ...( await this._getAssetsForFolder( category, { id: '/', name: '', childFolders: [] } ) ) );

		for ( const folder of category.folders ) {
			assets.push( ...( await this._getAssetsForFolder( category, folder ) ) );
		}

		return assets;
	}

	private async _getAssetsForFolder( category: ISourceCategory, folder: ISourceFolder ): Promise<ISourceAsset[]> {
		const assets: ISourceAsset[] = [];

		const assetsResponse: CKFinderGetFilesResponse = await this._fetch(
			{ command: 'GetFiles', type: category.name, currentFolder: folder.id },
			CKFinderGetFilesResponse
		);

		for ( const asset of assetsResponse.files ) {
			const parsedPath: ParsedPath = path.parse( asset.name );

			assets.push( {
				id: `${ folder.id }${ asset.name }`,
				name: parsedPath.name,
				extension: parsedPath.ext.substring( 1 ),
				// TODO: Use URL constructor.
				downloadUrl: `${ this._config.connectorPath }?command=Proxy&type=${ category.id }&currentFolder=${ folder.id }&fileName=${ asset.name }`,
				// TODO: Use GetFileURL command
				downloadUrlToReplace: `${ category.id }${ folder.id }${ asset.name }`,
				location: {
					categoryId: category.id,
					// TODO: Add test for this scenario.
					folderId: folder.id === '/' ? undefined : folder.id
				}
			} );
		}

		for ( const childFolder of folder.childFolders ) {
			assets.push( ...( await this._getAssetsForFolder( category, childFolder ) ) );
		}

		return assets;
	}

	private async _fetchStream( downloadUrl: string ): Promise<NodeJS.ReadableStream> {
		const response: Response = await fetch( downloadUrl, { headers: this._config.authentication.headers } );

		if ( !response.ok ) {
			throw new Error( `Failed to fetch data from ${ downloadUrl }. Status ${ response.status }. ${ await response.text() }` );
		}

		return response.body;
	}

	private async _fetch<T extends object>( parameters: Record<string, string>, responseType: new () => T ): Promise<T> {
		const params: string = new URLSearchParams( parameters ).toString();
		const url: string = `${ this._config.connectorPath }?${ params }`;
		const response: Response = await fetch( url, { headers: this._config.authentication.headers } );

		if ( !response.ok ) {
			throw new Error( `Failed to fetch data from ${ url }. Status ${ response.status }. ${ await response.text() }` );
		}

		const plainResponse: unknown = await response.json();

		const deserializedResponse: T = plainToInstance( responseType, plainResponse );

		try {
			await validateOrReject( deserializedResponse );
		} catch ( error ) {
			// TODO: Use logger.
			console.log( `Invalid response for ${ url } request.` );

			throw error;
		}

		return deserializedResponse;
	}

	/**
	 * Use promiseMap() instead of Promise.all() to avoid too many concurrent requests.
	 */
	private async _promiseMap<T, U>( array: T[], callback: ( item: T ) => Promise<U> ): Promise<U[]> {
		const results: U[] = [];

		for ( const item of array ) {
			results.push( await callback( item ) );
		}

		return results;
	}
}
