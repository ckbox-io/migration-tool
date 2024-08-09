/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateCKBoxClientTask from '@src/tasks/CreateCKBoxClientTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';

import { createMigratorConfigFake } from '../utils/_fakes';
import { MigratorConfig } from '@src/Config';
import CKBoxClient from '@src/CKBoxClient';

describe( 'CreateCKBoxClientTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let configFake: MigratorConfig;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			configFake = createMigratorConfigFake();
			abortController = new AbortController();

			context.setInstance( configFake );
		} );

		it( 'should create a client instance', async () => {
			const task: ITask<MigratorContext> = new CreateCKBoxClientTask();

			await task.run( context, abortController );

			assert( context.getInstance( CKBoxClient ) );
		} );
	} );
} );
