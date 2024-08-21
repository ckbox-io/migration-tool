/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { ISourceStorageAdapter } from './SourceStorageAdapter';

export interface ISourceStorageManager {
	loadAdapter( adapterName: string ): Promise<void>;

	getAdapter(): ISourceStorageAdapter;
}

export default class SourceStorageManager implements ISourceStorageManager {
	private _adapter: ISourceStorageAdapter | undefined;

	public async loadAdapter( adapterName: string ): Promise<void> {
		const adapterPath: string = path.resolve( `${ __dirname }/../dist-adapters/${ adapterName }/Adapter` );

		if ( await this._fileExists( `${ adapterPath }.js` ) === false ) {
			throw new Error( `Adapter "${ adapterName }" not found.` );
		}

		const Adapter = ( await import( adapterPath ) ).default;

		this._adapter = new Adapter();
	}

	public getAdapter(): ISourceStorageAdapter {
		if ( !this._adapter ) {
			throw new Error( 'Adapter not loaded.' );
		}

		return this._adapter;
	}

	private async _fileExists( path: string ): Promise<boolean> {
		try {
			await fs.access( path );

			return true;
		} catch ( error ) {
			if ( error.code === 'ENOENT' ) {
				return false;
			}

			throw error;
		}
	}
}
