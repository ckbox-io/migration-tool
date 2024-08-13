/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import VerifyAdapterConnectionTask from '@src/tasks/VerifyAdapterConnectionTask';
import { ITask } from '@src/Pipeline';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

import { createLoggerFake, createSourceStorageAdapterFake, createSourceStorageManagerFake, createUIFake } from '../utils/_fakes';
import { ISourceStorageManager } from '@src/SourceStorageManager';

describe( 'VerifyAdapterConnectionTask', () => {
	describe( 'run()', () => {
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;
		let adapterFake: ISourceStorageAdapter;
		let sourceStorageManagerFake: ISourceStorageManager;

		beforeEach( () => {
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();

			adapterFake = createSourceStorageAdapterFake();
			sourceStorageManagerFake = createSourceStorageManagerFake( adapterFake );
		} );

		it( 'should verify connection to source storage', async t => {
			const task: ITask = new VerifyAdapterConnectionTask( sourceStorageManagerFake );

			const verifyConnectionMock: Mock<Function> = t.mock.method( adapterFake, 'verifyConnection' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( verifyConnectionMock.mock.callCount(), 1 );
		} );
	} );
} );
