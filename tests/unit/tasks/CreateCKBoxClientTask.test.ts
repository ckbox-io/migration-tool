/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateCKBoxClientTask from '@src/tasks/CreateCKBoxClientTask';
import { ITask } from '@src/Pipeline';
import { MigratorConfig } from '@src/Config';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';
import { IConfigManager } from '@src/ConfigManager';
import { ICKBoxClientManager } from '@src/CKBoxClientManager';

import {
	createCKBoxClientManagerFake,
	createConfigManagerFake,
	createLoggerFake,
	createMigratorConfigFake,
	createUIFake
} from '../utils/_fakes';

describe( 'CreateCKBoxClientTask', () => {
	describe( 'run()', () => {
		let configFake: MigratorConfig;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;
		let configManagerFake: IConfigManager;
		let ckboxClientManagerFake: ICKBoxClientManager;

		beforeEach( () => {
			configFake = createMigratorConfigFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();
			configManagerFake = createConfigManagerFake( configFake );
			ckboxClientManagerFake = createCKBoxClientManagerFake();
		} );

		it( 'should create a client instance', async t => {
			const task: ITask = new CreateCKBoxClientTask( configManagerFake, ckboxClientManagerFake );
			const createClientMock = t.mock.method( ckboxClientManagerFake, 'createClient' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( createClientMock.mock.callCount(), 1 );
		} );
	} );
} );
