/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateMigrationPlanTask from '@src/tasks/CreateMigrationPlanTask';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';
import { IMigrationPlanManager } from '@src/MigrationPlanManager';
import { ISourceStorageManager } from '@src/SourceStorageManager';

import {
	createLoggerFake,
	createMigrationPlanManagerFake,
	createSourceStorageAdapterFake,
	createSourceStorageManagerFake,
	createUIFake
} from '../utils/_fakes';

describe( 'CreateMigrationPlanTask', () => {
	describe( 'run()', () => {
		let sourceStorageAdapterFake: ISourceStorageAdapter;
		let loggerFake: ILogger;
		let uiFake: IUI;
		let migrationPlan: IMigrationPlan;
		let abortController: AbortController;
		let migrationPlanManagerFake: IMigrationPlanManager;
		let sourceStorageManagerFake: ISourceStorageManager;
		let task: ITask;

		const urlMappingFilePath: string = 'example-url-mapping.json';

		beforeEach( () => {
			sourceStorageAdapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();

			migrationPlan = {
				categories: [
					{
						id: 'c-1',
						name: 'Category',
						allowedExtensions: [],
						folders: [
							{
								id: 'f-1',
								name: 'Folder',
								childFolders: [
									{
										id: 'f-2',
										name: 'Child Folder',
										childFolders: []
									}
								]
							}
						]
					}
				],
				assets: [
					{
						id: 'a-1',
						name: 'image',
						extension: 'jpg',
						downloadUrl: 'http://example.com/image.jpg',
						downloadUrlToReplace: 'http://example.com/image.jpg',
						location: { categoryId: 'c-1' }
					}
				]
			};

			migrationPlanManagerFake = createMigrationPlanManagerFake();
			sourceStorageManagerFake = createSourceStorageManagerFake( sourceStorageAdapterFake );

			task = new CreateMigrationPlanTask( migrationPlanManagerFake, sourceStorageManagerFake, urlMappingFilePath );
		} );

		it( 'should create a migration plan', async t => {
			t.mock.method( sourceStorageAdapterFake, 'prepareMigrationPlan', () => (
				Promise.resolve( migrationPlan )
			) );

			const createMigrationPlanMock = t.mock.method( migrationPlanManagerFake, 'createMigrationPlan' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( createMigrationPlanMock.mock.callCount(), 1 );

			const [ createdMigrationPlan ] = createMigrationPlanMock.mock.calls[ 0 ].arguments;

			assert.deepEqual( createdMigrationPlan.categories, migrationPlan.categories );
			assert.deepEqual( createdMigrationPlan.assets, migrationPlan.assets );
		} );

		it( 'should print migration plan summary', async t => {
			t.mock.method( sourceStorageAdapterFake, 'prepareMigrationPlan', () => (
				Promise.resolve( migrationPlan )
			) );

			const uiInfoMock = t.mock.method( uiFake, 'info', () => {} );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( uiInfoMock.mock.callCount(), 1 );
			assert.deepEqual( uiInfoMock.mock.calls[ 0 ].arguments, [
				'This tool will migrate files from the source storage using following steps:\n' +
				' - create asset categories in CKBox (1 category will be created: Category)\n' +
				' - copy folder structure to CKBox (2 folders will be created)\n' +
				' - copy files to CKBox (1 file will be copied)\n' +
				' - save the map of old and new file URLs (the map will be saved in example-url-mapping.json)\n'
			] );
		} );
	} );
} );
