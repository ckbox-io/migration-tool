/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import VerifyCKBoxConnectionTask from '@src/tasks/VerifyCKBoxConnectionTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import CKBoxClient, { ICKBoxClient } from '@src/CKBoxClient';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

import { createCKBoxClientFake, createLoggerFake, createUIFake } from '../utils/_fakes';

describe( 'VerifyCKBoxConnectionTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let clientFake: ICKBoxClient;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			clientFake = createCKBoxClientFake();
			abortController = new AbortController();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();

			context.setInstance( clientFake, CKBoxClient.name );
		} );

		it( 'should verify connection to CKBox', async t => {
			const task: ITask<MigratorContext> = new VerifyCKBoxConnectionTask();

			const verifyConnectionMock: Mock<Function> = t.mock.method( clientFake, 'verifyConnection' );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( verifyConnectionMock.mock.callCount(), 1 );
		} );
	} );
} );
