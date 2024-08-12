/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigrateAssetsTask from '@src/tasks/MigrateAssetsTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan, ISourceAsset, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import CKBoxClient, { ICKBoxClient } from '@src/CKBoxClient';
import UI, { IUI } from '@src/UI';
import Logger, { ILogger } from '@src/Logger';
import MigrationPlan from '@src/MigrationPlan';
import { IURLMappingWriter } from '@src/URLMappingWriter';

import {
	createCKBoxClientFake,
	createLoggerFake,
	createSourceStorageAdapterFake,
	createUIFake,
	createURLMappingWriterFake
} from '../utils/_fakes';
import { PassThrough } from 'node:stream';

describe( 'MigrateAssetsTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let clientFake: ICKBoxClient;
		let adapterFake: ISourceStorageAdapter;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let _urlMappingWriterFake: IURLMappingWriter;
		let abortController: AbortController;
		let migratedCategoriesMap: Map<string, string>;
		let migratedFoldersMap: Map<string, Map<string, string>>;

		beforeEach( () => {
			context = new MigratorContext();
			clientFake = createCKBoxClientFake();
			adapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			_urlMappingWriterFake = createURLMappingWriterFake();
			abortController = new AbortController();

			migratedCategoriesMap = new Map( [ [ 'c-1', 'migrated-category-id-c-1' ] ] );
			migratedFoldersMap = new Map( [ [ 'c-1', new Map( [ [ 'f-1', 'migrated-folder-id-f-1' ] ] ) ] ] );

			context.setInstance( clientFake, CKBoxClient.name );
			context.setInstance( uiFake, UI.name );
			context.setInstance( loggerFake, Logger.name );
			context.setInstance( adapterFake, 'Adapter' );
			context.setInstance( migratedCategoriesMap, 'MigratedCategoriesMap' );
			context.setInstance( migratedFoldersMap, 'MigratedFoldersMap' );
		} );

		it( 'should migrate assets of a category', async t => {
			const task: ITask<MigratorContext> = new MigrateAssetsTask( _urlMappingWriterFake );

			const stream: NodeJS.ReadableStream = new PassThrough();

			const uploadAssetMock: Mock<Function> = t.mock.method(
				clientFake,
				'uploadAsset',
				() => Promise.resolve( 'migrated-asset-id-a-1' )
			);

			const getAssetMock: Mock<Function> = t.mock.method(
				adapterFake,
				'getAsset',
				() => Promise.resolve( stream )
			);

			const sourceAssets: ISourceAsset[] = [
				{
					id: 'a-1',
					name: 'Asset 1',
					extension: 'jpg',
					downloadUrl: 'http://api.example.com/asset-1.jpg',
					location: { categoryId: 'c-1' },
					downloadUrlToReplace: 'http://cdn.example.com/asset-1.jpg'
				}
			];

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceAssets );

			context.setInstance( migrationPlan );

			await task.run( context, abortController );

			assert.equal( uploadAssetMock.mock.callCount(), 1 );
			assert.deepEqual( uploadAssetMock.mock.calls[ 0 ].arguments, [ {
				name: 'Asset 1.jpg',
				location: { categoryId: 'migrated-category-id-c-1' },
				stream
			} ] );

			assert.equal( getAssetMock.mock.callCount(), 1 );
			assert.deepEqual( getAssetMock.mock.calls[ 0 ].arguments, [ 'http://api.example.com/asset-1.jpg' ] );
		} );

		it( 'should migrate assets of a folder', async t => {
			const task: ITask<MigratorContext> = new MigrateAssetsTask( _urlMappingWriterFake );

			const stream: NodeJS.ReadableStream = new PassThrough();

			const uploadAssetMock: Mock<Function> = t.mock.method(
				clientFake,
				'uploadAsset',
				() => Promise.resolve( 'migrated-asset-id-a-1' )
			);

			const getAssetMock: Mock<Function> = t.mock.method(
				adapterFake,
				'getAsset',
				() => Promise.resolve( stream )
			);

			const sourceAssets: ISourceAsset[] = [
				{
					id: 'a-1',
					name: 'Asset 1',
					extension: 'jpg',
					downloadUrl: 'http://api.example.com/asset-1.jpg',
					location: { categoryId: 'c-1', folderId: 'f-1' },
					downloadUrlToReplace: 'http://cdn.example.com/asset-1.jpg'
				}
			];

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceAssets );

			context.setInstance( migrationPlan );

			await task.run( context, abortController );

			assert.equal( uploadAssetMock.mock.callCount(), 1 );
			assert.deepEqual( uploadAssetMock.mock.calls[ 0 ].arguments, [ {
				name: 'Asset 1.jpg',
				location: { folderId: 'migrated-folder-id-f-1' },
				stream
			} ] );

			assert.equal( getAssetMock.mock.callCount(), 1 );
			assert.deepEqual( getAssetMock.mock.calls[ 0 ].arguments, [ 'http://api.example.com/asset-1.jpg' ] );
		} );

		it( 'should notify about the progress', async t => {
			const task: ITask<MigratorContext> = new MigrateAssetsTask( _urlMappingWriterFake );

			const stream: NodeJS.ReadableStream = new PassThrough();

			t.mock.method(
				clientFake,
				'uploadAsset',
				() => Promise.resolve( 'migrated-asset-id-a-1' )
			);

			t.mock.method(
				adapterFake,
				'getAsset',
				() => Promise.resolve( stream )
			);

			const uiSpinnerMock: Mock<Function> = t.mock.method( uiFake, 'spinner' );

			const sourceAssets: ISourceAsset[] = [
				{
					id: 'a-1',
					name: 'Asset 1',
					extension: 'jpg',
					downloadUrl: 'http://api.example.com/asset-1.jpg',
					location: { categoryId: 'c-1', folderId: 'f-1' },
					downloadUrlToReplace: 'http://cdn.example.com/asset-1.jpg'
				},
				{
					id: 'a-2',
					name: 'Asset 2',
					extension: 'png',
					downloadUrl: 'http://api.example.com/asset-2.png',
					location: { categoryId: 'c-1', folderId: 'f-1' },
					downloadUrlToReplace: 'http://cdn.example.com/asset-2.png'
				}
			];

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceAssets );

			context.setInstance( migrationPlan );

			await task.run( context, abortController );

			assert.equal( uiSpinnerMock.mock.callCount(), 2 );
			assert.deepEqual( uiSpinnerMock.mock.calls[ 0 ].arguments, [ 'Copying assets: 0% (processing file 1 of 2)' ] );
			assert.deepEqual( uiSpinnerMock.mock.calls[ 1 ].arguments, [ 'Copying assets: 50% (processing file 2 of 2)' ] );
		} );
	} );
} );

function _createMigrationPlan( sourceAssets: ISourceAsset[] ): IMigrationPlan {
	return new MigrationPlan(
		[ {
			id: 'c-1',
			name: 'Category 1',
			allowedExtensions: [],
			folders: [
				{
					id: 'f-1',
					name: 'Folder 1',
					childFolders: []
				}
			]
		} ],
		sourceAssets
	);
}
