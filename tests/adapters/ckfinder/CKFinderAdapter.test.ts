/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import CKFinderAdapter from '@adapters/ckfinder/Adapter';

import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

const config: Record<string, unknown> = {
	connectorPath: 'http://localhost:8080/ckfinder/connector',
	authentication: {
		headers: {}
	}
};

describe( 'CKFinderAdapter', () => {
	describe( 'loadConfig()', () => {
		it( 'should load config', async () => {
			const adapter: ISourceStorageAdapter = new CKFinderAdapter();

			await assert.doesNotReject( async () => {
				await adapter.loadConfig( config );
			} );
		} );

		it( 'should throw an error if config is invalid', async () => {
			const adapter = new CKFinderAdapter();

			const invalidConfig: Record<string, unknown> = {
				...config,
				connectorPath: 1234
			};

			await assert.rejects( async () => {
				await adapter.loadConfig( invalidConfig );
			} );
		} );
	} );

	describe( 'verifyConnection()', () => {
		it( 'should pass if connection can be established', async () => {
			const adapter: ISourceStorageAdapter = new CKFinderAdapter();

			await adapter.loadConfig( config );

			await assert.doesNotReject( async () => {
				await adapter.verifyConnection();
			} );
		} );

		it( 'should throw an error if connection cannot be established', async () => {
			const adapter: ISourceStorageAdapter = new CKFinderAdapter();

			const invalidConfig: Record<string, unknown> = {
				...config,
				connectorPath: 'http://localhost:8080/ckfinder/invalid'
			};

			await adapter.loadConfig( invalidConfig );

			await assert.rejects( async () => {
				await adapter.verifyConnection();
			} );
		} );
	} );

	describe( 'analyzeStorage()', () => {
		afterEach( async () => {
			try {
				await _finderApiCall( 'POST', { command: 'DeleteFolder', type: 'Images', currentFolder: '/Foo' } );
			} catch ( error ) {
				// Ignore errors.
			}
		} );

		it( 'should return migration plan', async () => {
			// Finder by default has two "resourceTypes" (equivalent to CKBox categories) - "Images" and "Files".

			// After initialization, the "Images" category has the following structure:
			// - / (root)
			//   - /Foo
			//    - /Bar

			await _finderApiCall( 'POST', { command: 'CreateFolder', type: 'Images', currentFolder: '/', newFolderName: 'Foo' } );
			await _finderApiCall( 'POST', { command: 'CreateFolder', type: 'Images', currentFolder: '/Foo', newFolderName: 'Bar' } );

			const adapter: ISourceStorageAdapter = new CKFinderAdapter();

			await adapter.loadConfig( config );

			const plan: IMigrationPlan = await adapter.analyzeStorage();

			assert.deepEqual( plan, {
				categories: [
					{
						id: plan.categories[ 0 ].id,
						name: 'Files',
						allowedExtensions: plan.categories[ 0 ].allowedExtensions,
						folders: []
					},
					{
						id: plan.categories[ 1 ].id,
						name: 'Images',
						allowedExtensions: plan.categories[ 1 ].allowedExtensions,
						folders: [
							{
								id: plan.categories[ 1 ].folders[ 0 ].id,
								name: 'Foo',
								childFolders: [
									{
										id: plan.categories[ 1 ].folders[ 0 ].childFolders[ 0 ].id,
										name: 'Bar',
										childFolders: []
									}
								]
							}
						]
					}
				],
				assets: []
			} );
		} );
	} );

	describe( 'getAsset()', () => {
		it( 'should return a readable stream', t => {
			t.todo();
		} );
	} );
} );

async function _finderApiCall( method: 'GET' | 'POST' | 'DELETE', parameters: Record<string, string> ): Promise<unknown> {
	const params: string = new URLSearchParams( parameters ).toString();
	const url: string = `${ config.connectorPath }?${ params }`;
	const response: Response = await fetch( url, { method } );

	if ( !response.ok ) {
		throw new Error( `Failed to fetch data from ${ url }. Status ${ response.status }. ${ await response.text() }` );
	}

	return await response.json();
}
