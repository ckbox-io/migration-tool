/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateCKBoxClientTask from '@src/tasks/CreateCKBoxClientTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';

import { createLoggerFake, createMigratorConfigFake, createUIFake } from '../utils/_fakes';
import { MigratorConfig } from '@src/Config';
import CKBoxClient from '@src/CKBoxClient';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

describe( 'CreateCKBoxClientTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let configFake: MigratorConfig;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			configFake = createMigratorConfigFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();

			context.setInstance( configFake );
		} );

		it( 'should create a client instance', async () => {
			const task: ITask<MigratorContext> = new CreateCKBoxClientTask();

			await task.run( context, uiFake, loggerFake, abortController );

			assert( context.getInstance( CKBoxClient ) );
		} );
	} );
} );
