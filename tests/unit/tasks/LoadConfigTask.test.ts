/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { beforeEach, describe, it, Mock } from 'node:test';
import assert from 'node:assert/strict';

import LoadConfigTask from '@src/tasks/LoadConfigTask';
import { ITask } from '@src/Pipeline';
import { ILogger } from '@src/Logger';
import { IUI } from '@src/UI';
import { IConfigManager } from '@src/ConfigManager';
import { createConfigManagerFake, createLoggerFake, createUIFake } from '../utils/_fakes';

describe( 'LoadConfigTask', () => {
	describe( 'run()', () => {
		let abortController: AbortController;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let configManagerFake: IConfigManager;

		beforeEach( () => {
			abortController = new AbortController();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			configManagerFake = createConfigManagerFake();
		} );

		it( 'should load the configuration', async t => {
			const task: ITask = new LoadConfigTask( configManagerFake );
			const loadConfigMock: Mock<Function> = t.mock.method( configManagerFake, 'loadConfig' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( loadConfigMock.mock.callCount(), 1 );
		} );
	} );
} );
