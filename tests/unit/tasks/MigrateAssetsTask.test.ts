/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigrateAssetsTask from '@src/tasks/MigrateAssetsTask';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan, ISourceAsset, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { ICKBoxClient } from '@src/CKBoxClient';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';
import MigrationPlan from '@src/MigrationPlan';
import { IURLMappingWriter } from '@src/URLMappingWriter';

import {
	createCKBoxClientFake,
	createCKBoxClientManagerFake,
	createLoggerFake,
	createMigratedCategoriesRepositoryFake,
	createMigratedFoldersRepositoryFake,
	createMigrationPlanManagerFake,
	createSourceStorageAdapterFake,
	createSourceStorageManagerFake,
	createUIFake,
	createURLMappingWriterFake
} from '../utils/_fakes';
import { PassThrough } from 'node:stream';
import { IMigratedFoldersRepository } from '@src/repositories/MigratedFoldersRepository';
import { IMigratedCategoriesRepository } from '@src/repositories/MigratedCategoriesRepository';
import { ISourceStorageManager } from '@src/SourceStorageManager';
import { IMigrationPlanManager } from '@src/MigrationPlanManager';
import { ICKBoxClientManager } from '@src/CKBoxClientManager';

describe( 'MigrateAssetsTask', () => {
	describe( 'run()', () => {
		let clientFake: ICKBoxClient;
		let adapterFake: ISourceStorageAdapter;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let _urlMappingWriterFake: IURLMappingWriter;
		let abortController: AbortController;
		let migrationPlanManager: IMigrationPlanManager;
		let ckboxClientManagerFake: ICKBoxClientManager;
		let sourceStorageAdapterManagerFake: ISourceStorageManager;
		let migratedFoldersRepositoryFake: IMigratedFoldersRepository;
		let migratedCategoriesRepositoryFake: IMigratedCategoriesRepository;
		let task: ITask;

		beforeEach( () => {
			clientFake = createCKBoxClientFake();
			adapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			_urlMappingWriterFake = createURLMappingWriterFake();
			abortController = new AbortController();

			migratedFoldersRepositoryFake = createMigratedFoldersRepositoryFake();
			migratedCategoriesRepositoryFake = createMigratedCategoriesRepositoryFake();
			migrationPlanManager = createMigrationPlanManagerFake();
			ckboxClientManagerFake = createCKBoxClientManagerFake( clientFake );
			sourceStorageAdapterManagerFake = createSourceStorageManagerFake( adapterFake );

			task = new MigrateAssetsTask(
				migrationPlanManager,
				sourceStorageAdapterManagerFake,
				ckboxClientManagerFake,
				_urlMappingWriterFake,
				migratedCategoriesRepositoryFake,
				migratedFoldersRepositoryFake
			);
		} );

		it( 'should migrate assets of a category', async t => {
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

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			await task.run( uiFake, loggerFake, abortController );

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

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			await task.run( uiFake, loggerFake, abortController );

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

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			await task.run( uiFake, loggerFake, abortController );

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
