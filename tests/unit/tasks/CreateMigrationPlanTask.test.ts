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
				categories: [],
				assets: []
			};

			t.mock.method( sourceStorageAdapterFake, 'analyzeStorage', () => (
				Promise.resolve( migrationPlan )
			) );

			await task.run( context );

			const migrationPlanFromContext: IMigrationPlan = context.getInstance( 'MigrationPlan' );

			assert.equal( migrationPlanFromContext, migrationPlan );
		} );
	} );
} );
