/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import VerifyAdapterConnectionTask from '@src/tasks/VerifyAdapterConnectionTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

import { createLoggerFake, createSourceStorageAdapterFake, createUIFake } from '../utils/_fakes';

describe( 'VerifyAdapterConnectionTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let adapterFake: ISourceStorageAdapter;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			adapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();

			context.setInstance( adapterFake, 'Adapter' );
		} );

		it( 'should verify connection to source storage', async t => {
			const task: ITask<MigratorContext> = new VerifyAdapterConnectionTask();

			const verifyConnectionMock: Mock<Function> = t.mock.method( adapterFake, 'verifyConnection' );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( verifyConnectionMock.mock.callCount(), 1 );
		} );
	} );
} );
