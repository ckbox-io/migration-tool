/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import VerifyAdapterConnectionTask from '@src/tasks/VerifyAdapterConnectionTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';

import { createSourceStorageAdapterFake } from '../utils/_fakes';

describe( 'VerifyAdapterConnectionTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let adapterFake: ISourceStorageAdapter;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			adapterFake = createSourceStorageAdapterFake();
			abortController = new AbortController();

			context.setInstance( adapterFake, 'Adapter' );
		} );

		it( 'should verify connection to source storage', async t => {
			const task: ITask<MigratorContext> = new VerifyAdapterConnectionTask();

			const verifyConnectionMock: Mock<Function> = t.mock.method( adapterFake, 'verifyConnection' );

			await task.run( context, abortController );

			assert.equal( verifyConnectionMock.mock.callCount(), 1 );
		} );
	} );
} );
