/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateMigrationPlanTask from '@src/tasks/CreateMigrationPlanTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan, ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { createSourceStorageAdapterFake } from '../utils/_fakes';
import MigrationPlan from '@src/MigrationPlan';

describe( 'CreateMigrationPlanTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let sourceStorageAdapterFake: ISourceStorageAdapter;

		beforeEach( () => {
			context = new MigratorContext();

			sourceStorageAdapterFake = createSourceStorageAdapterFake();

			context.setInstance( sourceStorageAdapterFake, 'Adapter' );
		} );

		it( 'should create a migration plan', async t => {
			const task: ITask<MigratorContext> = new CreateMigrationPlanTask();

			const migrationPlan: IMigrationPlan = {
				categories: [
					{
						id: 'c-1',
						name: 'Category',
						allowedExtensions: [],
						folders: []
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

			t.mock.method( sourceStorageAdapterFake, 'prepareMigrationPlan', () => (
				Promise.resolve( migrationPlan )
			) );

			await task.run( context );

			const migrationPlanFromContext: IMigrationPlan = context.getInstance( MigrationPlan );

			assert.deepEqual( migrationPlanFromContext.categories, migrationPlan.categories );
			assert.deepEqual( migrationPlanFromContext.assets, migrationPlan.assets );
		} );
	} );
} );
