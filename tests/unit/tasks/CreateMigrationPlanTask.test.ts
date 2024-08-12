/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateMigrationPlanTask from '@src/tasks/CreateMigrationPlanTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { createSourceStorageAdapterFake, createUIFake } from '../utils/_fakes';
import MigrationPlan from '@src/MigrationPlan';
import UI, { IUI } from '@src/UI';

describe( 'CreateMigrationPlanTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let sourceStorageAdapterFake: ISourceStorageAdapter;
		let uiFake: IUI;
		let migrationPlan: IMigrationPlan;
		let abortController: AbortController;

		const urlMappingFilePath: string = 'example-url-mapping.json';

		beforeEach( () => {
			context = new MigratorContext();
			sourceStorageAdapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
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

			context.setInstance( sourceStorageAdapterFake, 'Adapter' );
			context.setInstance( uiFake, UI.name );
		} );

		it( 'should create a migration plan', async t => {
			const task: ITask<MigratorContext> = new CreateMigrationPlanTask( urlMappingFilePath );

			t.mock.method( sourceStorageAdapterFake, 'prepareMigrationPlan', () => (
				Promise.resolve( migrationPlan )
			) );

			await task.run( context, abortController );

			const migrationPlanFromContext: IMigrationPlan = context.getInstance( MigrationPlan );

			assert.deepEqual( migrationPlanFromContext.categories, migrationPlan.categories );
			assert.deepEqual( migrationPlanFromContext.assets, migrationPlan.assets );
		} );

		it( 'should print migration plan summary', async t => {
			const task: ITask<MigratorContext> = new CreateMigrationPlanTask( urlMappingFilePath );

			t.mock.method( sourceStorageAdapterFake, 'prepareMigrationPlan', () => (
				Promise.resolve( migrationPlan )
			) );

			const uiInfoMock = t.mock.method( uiFake, 'info', () => {} );

			await task.run( context, abortController );

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
