/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ISourceStorageAdapter } from './SourceStorageAdapter';

export interface IAdapterFactory {
	createAdapter( adapterName: string ): Promise<ISourceStorageAdapter>;
}

export class AdapterFactory implements IAdapterFactory {
	public async createAdapter( adapterName: string ): Promise<ISourceStorageAdapter> {
		try {
			const Adapter = ( await import( `../dist-adapters/${ adapterName }/Adapter` ) ).default;

			return new Adapter();
		} catch ( error ) {
			if ( error instanceof Error && ( error as NodeJS.ErrnoException ).code === 'MODULE_NOT_FOUND' ) {
				console.log( error );

				throw new Error( `Adapter "${ adapterName }" not found.`, { cause: error } );
			}

			throw error;
		}
	}
}
