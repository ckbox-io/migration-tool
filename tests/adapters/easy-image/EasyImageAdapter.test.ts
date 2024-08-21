/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import EasyImageAdapter from '@adapters/easy-image/Adapter';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';

const serviceOrigin: string = 'http://localhost:8080/easyimage';

const config: Record<string, unknown> = {
	serviceOrigin,
	accessCredentials: {
		accessKey: 'accessKey',
		environmentId: 'example-env-id-d4dOW'
	}
};

describe( 'EasyImageAdapter', () => {
	describe( 'loadConfig()', () => {
		it( 'should load config', async () => {
			const adapter: ISourceStorageAdapter = new EasyImageAdapter();

			await assert.doesNotReject( async () => {
				await adapter.loadConfig( config );
			} );
		} );

		it( 'should throw an error if config is invalid', async () => {
			const adapter = new EasyImageAdapter();

			const invalidConfig: Record<string, unknown> = {
				...config,
				serviceOrigin: 1234
			};

			await assert.rejects( async () => {
				await adapter.loadConfig( invalidConfig );
			} );
		} );
	} );

	describe( 'verifyConnection()', () => {
		it( 'should pass if connection can be established', async () => {
			const adapter: ISourceStorageAdapter = new EasyImageAdapter();

			await adapter.loadConfig( config );

			nock( serviceOrigin )
				.get( '/list' )
				.reply( 200 );

			await assert.doesNotReject( async () => {
				await adapter.verifyConnection();
			} );
		} );

		it( 'should throw an error if connection cannot be established', async () => {
			const adapter: ISourceStorageAdapter = new EasyImageAdapter();

			await adapter.loadConfig( config );

			nock( serviceOrigin )
				.get( '/list' )
				.reply( 404 );

			await assert.rejects( async () => {
				await adapter.verifyConnection();
			} );
		} );
	} );

	describe( 'prepareMigrationPlan()', () => {
		it( 'should return a migration plan', async () => {
			const adapter: ISourceStorageAdapter = new EasyImageAdapter();

			await adapter.loadConfig( config );

			nock( serviceOrigin )
				.get( '/list' )
				.reply( 200, {
					images: [
						'http://localhost:8080/easyimage/images/image1.jpg',
						'http://localhost:8080/easyimage/images/image2.jpg'
					],
					animations: [
						'http://localhost:8080/easyimage/animations/animation1.gif'
					],
					files: [
						'http://localhost:8080/easyimage/files/file1.txt'
					]
				} );

			const plan: IMigrationPlan = await adapter.prepareMigrationPlan();

			assert.ok( plan );
			assert.strictEqual( plan.categories.length, 3 );
			assert.strictEqual( plan.categories[ 0 ].allowedExtensions.length, 5 );
			assert.strictEqual( plan.categories[ 1 ].allowedExtensions.length, 1 );
			assert.strictEqual( plan.categories[ 2 ].allowedExtensions.length, 1 );

			assert.strictEqual( plan.assets.length, 4 );
			assert.deepEqual( plan.assets[ 0 ], {
				id: 'http://localhost:8080/easyimage/images/image1.jpg',
				name: 'image1',
				extension: 'jpg',
				location: {
					categoryId: 'images'
				},
				downloadUrl: 'http://localhost:8080/easyimage/images/image1.jpg',
				downloadUrlToReplace: 'http://localhost:8080/easyimage/images/image1.jpg'
			} );

			assert.deepEqual( plan.assets[ 1 ], {
				id: 'http://localhost:8080/easyimage/images/image2.jpg',
				name: 'image2',
				extension: 'jpg',
				location: {
					categoryId: 'images'
				},
				downloadUrl: 'http://localhost:8080/easyimage/images/image2.jpg',
				downloadUrlToReplace: 'http://localhost:8080/easyimage/images/image2.jpg'
			} );

			assert.deepEqual( plan.assets[ 2 ], {
				id: 'http://localhost:8080/easyimage/animations/animation1.gif',
				name: 'animation1',
				extension: 'gif',
				location: {
					categoryId: 'animations'
				},
				downloadUrl: 'http://localhost:8080/easyimage/animations/animation1.gif',
				downloadUrlToReplace: 'http://localhost:8080/easyimage/animations/animation1.gif'
			} );

			assert.deepEqual( plan.assets[ 3 ], {
				id: 'http://localhost:8080/easyimage/files/file1.txt',
				name: 'file1',
				extension: 'txt',
				location: {
					categoryId: 'files'
				},
				downloadUrl: 'http://localhost:8080/easyimage/files/file1.txt',
				downloadUrlToReplace: 'http://localhost:8080/easyimage/files/file1.txt'
			} );
		} );

		it( 'should return a migration plan with empty categories if there are no files', async () => {
			const adapter: ISourceStorageAdapter = new EasyImageAdapter();

			await adapter.loadConfig( config );

			nock( serviceOrigin )
				.get( '/list' )
				.reply( 200, {
					images: [],
					animations: [],
					files: []
				} );

			const plan: IMigrationPlan = await adapter.prepareMigrationPlan();

			assert.ok( plan );
			assert.strictEqual( plan.categories.length, 3 );
			assert.strictEqual( plan.categories[ 0 ].allowedExtensions.length, 5 );
			assert.strictEqual( plan.categories[ 1 ].allowedExtensions.length, 1 );
			assert.strictEqual( plan.categories[ 2 ].allowedExtensions.length, 0 );
		} );
	} );

	describe( 'getAsset()', () => {
		it( 'should return a stream', async () => {
			const adapter: ISourceStorageAdapter = new EasyImageAdapter();

			await adapter.loadConfig( config );

			const assetUrl: string = 'http://localhost:8080/easyimage/asset.jpg';

			nock( serviceOrigin )
				.get( '/asset.jpg' )
				.reply( 200 );

			const stream = await adapter.getAsset( assetUrl );

			assert.ok( stream );
		} );
	} );
} );
