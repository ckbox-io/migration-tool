/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import LoadConfigTask from '@src/tasks/LoadConfigTask';
import MigratorContext from '@src/MigratorContext';
import { MigratorConfig } from '@src/Config';
import { ITask } from '@src/Pipeline';

describe( 'LoadConfigTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;

		beforeEach( () => {
			context = new MigratorContext();
		} );

		it( 'should load the configuration', async () => {
			const task: ITask<MigratorContext> = new LoadConfigTask();

			await task.run( context );

			assert( context.getInstance( MigratorConfig ) );
		} );
	} );
} );
