/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import VerifyCKBoxConnectionTask from '@src/tasks/VerifyCKBoxConnectionTask';
import { ITask } from '@src/Pipeline';
import { ICKBoxClient } from '@src/CKBoxClient';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

import { createCKBoxClientFake, createCKBoxClientManagerFake, createLoggerFake, createUIFake } from '../utils/_fakes';
import { ICKBoxClientManager } from '@src/CKBoxClientManager';

describe( 'VerifyCKBoxConnectionTask', () => {
	describe( 'run()', () => {
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;
		let clientFake: ICKBoxClient;
		let ckboxClientManagerFake: ICKBoxClientManager;

		beforeEach( () => {
			abortController = new AbortController();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			clientFake = createCKBoxClientFake();
			ckboxClientManagerFake = createCKBoxClientManagerFake( clientFake );
		} );

		it( 'should verify connection to CKBox', async t => {
			const task: ITask = new VerifyCKBoxConnectionTask( ckboxClientManagerFake );

			const verifyConnectionMock: Mock<Function> = t.mock.method( clientFake, 'verifyConnection' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( verifyConnectionMock.mock.callCount(), 1 );
		} );
	} );
} );
