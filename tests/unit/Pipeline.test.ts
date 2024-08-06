/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { IUI } from '@src/UI';
import Pipeline, { IPipeline, ITask } from '@src/Pipeline';

import { createUIFake } from './utils/_fakes';

describe( 'Pipeline', () => {
	describe( 'run()', () => {
		type ContextStub = Record<string, string>;

		let uiStub: IUI;

		let contextStub: ContextStub;
		let taskMock: ITask<ContextStub>;
		let taskMock2: ITask<ContextStub>;
		let failingTaskMock: ITask<ContextStub>;

		beforeEach( () => {
			contextStub = {};

			uiStub = createUIFake();

			taskMock = {
				processingMessage: 'Processing taskMock',
				successMessage: 'TaskMock succeeded',
				failureMessage: 'TaskMock failed',
				run: ( context: ContextStub ) => {
					context.taskMock = 'taskMock';

					return Promise.resolve();
				}
			};

			taskMock2 = {
				run: ( context: ContextStub ) => {
					context.taskMock2 = 'taskMock2';

					return Promise.resolve();
				}
			};

			failingTaskMock = {
				failureMessage: 'Task failed',
				run: () => Promise.reject( new Error( 'Task failed' ) )
			};
		} );

		it( 'should execute all tasks in the pipeline', async () => {
			const pipeline: IPipeline<ContextStub> = new Pipeline<ContextStub>(
				[ taskMock, taskMock2 ],
				uiStub
			);

			await pipeline.run( contextStub );

			assert.strictEqual( contextStub.taskMock, 'taskMock' );
			assert.strictEqual( contextStub.taskMock2, 'taskMock2' );
		} );

		it( 'should stop executing tasks if one of them fails', async () => {
			const pipeline: IPipeline<ContextStub> = new Pipeline<ContextStub>(
				[ taskMock, failingTaskMock, taskMock2 ],
				uiStub
			);

			await assert.rejects( async () => {
				await pipeline.run( contextStub );
			} );

			assert.strictEqual( contextStub.taskMock, 'taskMock' );
			assert.strictEqual( contextStub.taskMock2, undefined );
		} );

		it( 'should display a spinner while executing tasks', async t => {
			const spinnerMock: Mock<Function> = t.mock.method( uiStub, 'spinner' );

			const pipeline: IPipeline<ContextStub> = new Pipeline<ContextStub>( [ taskMock ], uiStub );

			await pipeline.run( contextStub );

			assert.equal( spinnerMock.mock.callCount(), 1 );
			assert.deepEqual( spinnerMock.mock.calls[ 0 ].arguments, [ 'Processing taskMock' ] );
		} );

		it( 'should display a success message after executing task', async t => {
			const succeedMock: Mock<Function> = t.mock.method( uiStub, 'succeed' );

			const pipeline: IPipeline<ContextStub> = new Pipeline<ContextStub>( [ taskMock ], uiStub );

			await pipeline.run( contextStub );

			assert.equal( succeedMock.mock.callCount(), 1 );
			assert.deepEqual( succeedMock.mock.calls[ 0 ].arguments, [ 'TaskMock succeeded' ] );
		} );

		it( 'should display a failure message if task fails', async t => {
			const failMock: Mock<Function> = t.mock.method( uiStub, 'fail' );

			const pipeline: IPipeline<ContextStub> = new Pipeline<ContextStub>( [ failingTaskMock ], uiStub );

			await assert.rejects( async () => {
				await pipeline.run( contextStub );
			} );

			assert.equal( failMock.mock.callCount(), 1 );
			assert.deepEqual( failMock.mock.calls[ 0 ].arguments, [ 'Task failed' ] );
		} );
	} );
} );
