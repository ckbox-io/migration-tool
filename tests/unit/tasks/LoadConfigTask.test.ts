/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import LoadConfigTask from '@src/tasks/LoadConfigTask';
import MigratorContext from '@src/MigratorContext';
import { MigratorConfig } from '@src/Config';
import { ITask } from '@src/Pipeline';
import { ILogger } from '@src/Logger';
import { IUI } from '@src/UI';
import { createLoggerFake, createUIFake } from '../utils/_fakes';

describe( 'LoadConfigTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let abortController: AbortController;
		let uiFake: IUI;
		let loggerFake: ILogger;

		beforeEach( () => {
			context = new MigratorContext();
			abortController = new AbortController();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
		} );

		it( 'should load the configuration', async () => {
			const task: ITask<MigratorContext> = new LoadConfigTask();

			await task.run( context, uiFake, loggerFake, abortController );

			assert( context.getInstance( MigratorConfig ) );
		} );
	} );
} );
