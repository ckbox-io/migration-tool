/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';
import Pipeline, { IPipeline, ITask } from '@src/Pipeline';

import { createLoggerFake, createUIFake } from './utils/_fakes';

describe( 'Pipeline', () => {
	describe( 'run()', () => {
		let uiFake: IUI;
		let loggerFake: ILogger;

		let context: Record<string, unknown>;
		let taskMock: ITask;
		let taskMock2: ITask;
		let failingTaskMock: ITask;
		let abortedTaskMock: ITask;

		beforeEach( () => {
			context = {};

			uiFake = createUIFake();
			loggerFake = createLoggerFake();

			taskMock = {
				processingMessage: 'Processing taskMock',
				successMessage: 'TaskMock succeeded',
				failureMessage: 'TaskMock failed',
				run: () => {
					context.taskMock = 'taskMock';

					return Promise.resolve();
				}
			};

			taskMock2 = {
				run: () => {
					context.taskMock2 = 'taskMock2';

					return Promise.resolve();
				}
			};

			failingTaskMock = {
				failureMessage: 'Task failed',
				run: () => Promise.reject( new Error( 'Task failed' ) )
			};

			abortedTaskMock = {
				run: ( ui: IUI, logger: ILogger, abortController: AbortController ) => {
					abortController.abort();

					return Promise.resolve();
				}
			};
		} );

		it( 'should execute all tasks in the pipeline', async () => {
			const pipeline: IPipeline = new Pipeline(
				[ taskMock, taskMock2 ],
				uiFake,
				loggerFake
			);

			await pipeline.run();

			assert.strictEqual( context.taskMock, 'taskMock' );
			assert.strictEqual( context.taskMock2, 'taskMock2' );
		} );

		it( 'should stop executing tasks if one of them fails', async () => {
			const pipeline: IPipeline = new Pipeline(
				[ taskMock, failingTaskMock, taskMock2 ],
				uiFake,
				loggerFake
			);

			await assert.rejects( async () => {
				await pipeline.run();
			} );

			assert.strictEqual( context.taskMock, 'taskMock' );
			assert.strictEqual( context.taskMock2, undefined );
		} );

		it( 'should display a spinner while executing tasks', async t => {
			const spinnerMock: Mock<Function> = t.mock.method( uiFake, 'spinner', () => {} );

			const pipeline: IPipeline = new Pipeline( [ taskMock ], uiFake, loggerFake );

			await pipeline.run();

			assert.equal( spinnerMock.mock.callCount(), 1 );
			assert.deepEqual( spinnerMock.mock.calls[ 0 ].arguments, [ 'Processing taskMock' ] );
		} );

		it( 'should display a success message after executing task', async t => {
			const succeedMock: Mock<Function> = t.mock.method( uiFake, 'succeed', () => {} );

			const pipeline: IPipeline = new Pipeline( [ taskMock ], uiFake, loggerFake );

			await pipeline.run();

			assert.equal( succeedMock.mock.callCount(), 1 );
			assert.deepEqual( succeedMock.mock.calls[ 0 ].arguments, [ 'TaskMock succeeded' ] );
		} );

		it( 'should display a failure message if task fails', async t => {
			const failMock: Mock<Function> = t.mock.method( uiFake, 'fail', () => {} );

			const pipeline: IPipeline = new Pipeline( [ failingTaskMock ], uiFake, loggerFake );

			await assert.rejects( async () => {
				await pipeline.run();
			} );

			assert.equal( failMock.mock.callCount(), 1 );
			assert.deepEqual( failMock.mock.calls[ 0 ].arguments, [ 'Task failed' ] );
		} );

		it( 'should stop executing tasks if one of them is aborted', async t => {
			const infoMock: Mock<Function> = t.mock.method( uiFake, 'info', () => {} );
			const runMock: Mock<Function> = t.mock.method( taskMock2, 'run', () => {} );

			const pipeline: IPipeline = new Pipeline(
				[ taskMock, abortedTaskMock, taskMock2 ],
				uiFake,
				loggerFake
			);

			await pipeline.run();

			assert.equal( infoMock.mock.callCount(), 1 );
			assert.deepEqual( infoMock.mock.calls[ 0 ].arguments, [ 'Migration aborted' ] );
			assert.equal( runMock.mock.callCount(), 0 );
		} );
	} );
} );
