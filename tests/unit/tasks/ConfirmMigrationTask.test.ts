/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import ConfirmMigrationTask from '@src/tasks/ConfirmMigrationTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { IUI } from '@src/UI';

import { createLoggerFake, createUIFake } from '../utils/_fakes';
import { ILogger } from '@src/Logger';

describe( 'ConfirmMigrationTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();
		} );

		it( 'should print prompt', async t => {
			const task: ITask<MigratorContext> = new ConfirmMigrationTask();

			const promptMock: Mock<Function> = t.mock.method( uiFake, 'prompt', () => 'y' );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( promptMock.mock.callCount(), 1 );
			assert.deepEqual( promptMock.mock.calls[ 0 ].arguments, [ 'Do you want to start the migration? (Y/n) ' ] );
		} );

		it( 'should confirm migration', async t => {
			const task: ITask<MigratorContext> = new ConfirmMigrationTask();

			t.mock.method( uiFake, 'prompt', () => 'y' );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( abortController.signal.aborted, false );
		} );

		it( 'should abort migration', async t => {
			const task: ITask<MigratorContext> = new ConfirmMigrationTask();

			t.mock.method( uiFake, 'prompt', () => 'n' );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( abortController.signal.aborted, true );
		} );
	} );
} );
