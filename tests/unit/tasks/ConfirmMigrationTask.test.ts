/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import ConfirmMigrationTask from '@src/tasks/ConfirmMigrationTask';
import { ITask } from '@src/Pipeline';
import { IUI } from '@src/UI';

import { createLoggerFake, createUIFake } from '../utils/_fakes';
import { ILogger } from '@src/Logger';

describe( 'ConfirmMigrationTask', () => {
	describe( 'run()', () => {
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;

		beforeEach( () => {
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();
		} );

		it( 'should print prompt', async t => {
			const task: ITask = new ConfirmMigrationTask( false );

			const promptMock: Mock<Function> = t.mock.method( uiFake, 'prompt', () => 'y' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( promptMock.mock.callCount(), 1 );
			assert.deepEqual( promptMock.mock.calls[ 0 ].arguments, [ 'Do you want to start the migration? (Y/n) ' ] );
		} );

		it( 'should confirm migration', async t => {
			const task: ITask = new ConfirmMigrationTask( false );

			t.mock.method( uiFake, 'prompt', () => 'y' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( abortController.signal.aborted, false );
		} );

		it( 'should abort migration', async t => {
			const task: ITask = new ConfirmMigrationTask( false );

			t.mock.method( uiFake, 'prompt', () => 'n' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( abortController.signal.aborted, true );
		} );

		it( 'should abort migration in dry-run mode', async () => {
			const task: ITask = new ConfirmMigrationTask( true );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( abortController.signal.aborted, true );
		} );
	} );
} );
