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

	describe( 'prepareMigrationPlan()', () => {
		afterEach( async () => {
			try {
				await _finderApiCall( 'POST', { command: 'DeleteFolder', type: 'Files', currentFolder: '/Foo' } );
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
			//      - file.txt

			await _finderApiCall( 'POST', { command: 'CreateFolder', type: 'Files', currentFolder: '/', newFolderName: 'Foo' } );
			await _finderApiCall( 'POST', { command: 'CreateFolder', type: 'Files', currentFolder: '/Foo', newFolderName: 'Bar' } );

			await _finderApiCall(
				'POST',
				{ command: 'FileUpload', type: 'Files', currentFolder: '/Foo/Bar' },
				Buffer.from( 'foo' ),
				'file.txt'
			);

			const adapter: ISourceStorageAdapter = new CKFinderAdapter();

			await adapter.loadConfig( config );

			const plan: IMigrationPlan = await adapter.prepareMigrationPlan();

			assert.deepEqual( plan.categories, [
				{
					id: 'Files',
					name: 'Files',
					allowedExtensions: plan.categories[ 0 ].allowedExtensions,
					folders: [
						{
							id: '/Foo/',
							name: 'Foo',
							childFolders: [
								{
									id: '/Foo/Bar/',
									name: 'Bar',
									childFolders: []
								}
							]
						}
					]
				},
				{
					id: 'Images',
					name: 'Images',
					allowedExtensions: plan.categories[ 1 ].allowedExtensions,
					folders: []
				}
			] );

			assert.deepEqual( plan.assets, [
				{
					id: '/Foo/Bar/file.txt',
					name: 'file',
					extension: 'txt',
					downloadUrl: `${ config.connectorPath }?command=Proxy&type=Files&currentFolder=/Foo/Bar/&fileName=file.txt`,
					downloadUrlToReplace: 'http://localhost:8080/userfiles/files/Foo/Bar/file.txt',
					location: {
						categoryId: 'Files',
						folderId: '/Foo/Bar/'
					}
				}
			] );
		} );
	} );

	describe( 'getAsset()', () => {
		it( 'should return a readable stream', t => {
			t.todo();
		} );
	} );
} );

async function _finderApiCall(
	method: 'GET' | 'POST' | 'DELETE',
	parameters: Record<string, string>,
	body?: Buffer | Record<string, unknown>,
	filename?: string
): Promise<unknown> {
	const params: string = new URLSearchParams( parameters ).toString();
	const url: string = `${ config.connectorPath }?${ params }`;
	const response: Response = await fetch(
		url,
		{
			method,
			body: body ? _formatBody( body, filename ) : undefined
		}
	);

	if ( !response.ok ) {
		throw new Error( `Failed to fetch data from ${ url }. Status ${ response.status }. ${ await response.text() }` );
	}

	return await response.json();
}

function _formatBody( uploadBody: Buffer | unknown, filename?: string ): FormData | Buffer {
	if ( !( uploadBody instanceof Buffer ) ) {
		return Buffer.from( JSON.stringify( uploadBody ) );
	}

	const formData: FormData = new FormData();

	formData.append( 'upload', new Blob( [ uploadBody ] ), filename );

	return formData;
}
