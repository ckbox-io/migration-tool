/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import ConfirmMigrationTask from '@src/tasks/ConfirmMigrationTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import UI, { IUI } from '@src/UI';

import { createUIFake } from '../utils/_fakes';

describe( 'ConfirmMigrationTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let uiFake: IUI;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			uiFake = createUIFake();
			abortController = new AbortController();

			context.setInstance( uiFake, UI.name );
		} );

		it( 'should print prompt', async t => {
			const task: ITask<MigratorContext> = new ConfirmMigrationTask();

			const promptMock: Mock<Function> = t.mock.method( uiFake, 'prompt', () => 'y' );

			await task.run( context, abortController );

			assert.equal( promptMock.mock.callCount(), 1 );
			assert.deepEqual( promptMock.mock.calls[ 0 ].arguments, [ 'Do you want to start the migration? (Y/n) ' ] );
		} );

		it( 'should confirm migration', async t => {
			const task: ITask<MigratorContext> = new ConfirmMigrationTask();

			t.mock.method( uiFake, 'prompt', () => 'y' );

			await task.run( context, abortController );

			assert.equal( abortController.signal.aborted, false );
		} );

		it( 'should abort migration', async t => {
			const task: ITask<MigratorContext> = new ConfirmMigrationTask();

			t.mock.method( uiFake, 'prompt', () => 'n' );

			await task.run( context, abortController );

			assert.equal( abortController.signal.aborted, true );
		} );
	} );
} );
