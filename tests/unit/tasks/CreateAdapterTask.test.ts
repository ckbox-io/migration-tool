/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateAdapterTask from '@src/tasks/CreateAdapterTask';
import MigratorContext from '@src/MigratorContext';
import { IAdapterFactory } from '@src/AdapterFactory';
import { ITask } from '@src/Pipeline';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { ILogger } from '@src/Logger';
import { IUI } from '@src/UI';

import {
	createAdapterFactoryFake,
	createLoggerFake,
	createMigratorConfigFake,
	createSourceStorageAdapterFake,
	createUIFake
} from '../utils/_fakes';

describe( 'CreateAdapterTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let adapterFactoryFake: IAdapterFactory;
		let adapterFake: ISourceStorageAdapter;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let adapterConfig: Record<string, unknown>;
		let abortController: AbortController;

		beforeEach( () => {
			context = new MigratorContext();
			adapterFactoryFake = createAdapterFactoryFake();
			adapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			adapterConfig = { foo: 'bar' };
			abortController = new AbortController();

			context.setInstance( createMigratorConfigFake( adapterConfig ) );
		} );

		it( 'should create an adapter instance', async t => {
			const task: ITask<MigratorContext> = new CreateAdapterTask( adapterFactoryFake );

			const createAdapterMock: Mock<Function> = t.mock.method( adapterFactoryFake, 'createAdapter', () => adapterFake );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( createAdapterMock.mock.callCount(), 1 );
			assert.deepEqual( createAdapterMock.mock.calls[ 0 ].arguments, [ 'FakeAdapter' ] );

			assert( context.getInstance( 'Adapter' ) );
		} );

		it( 'should load the configuration', async t => {
			const task: ITask<MigratorContext> = new CreateAdapterTask( adapterFactoryFake );

			const loadConfigMock: Mock<Function> = t.mock.method( adapterFake, 'loadConfig' );

			t.mock.method( adapterFactoryFake, 'createAdapter', () => adapterFake );

			await task.run( context, uiFake, loggerFake, abortController );

			assert.equal( loadConfigMock.mock.callCount(), 1 );
			assert.deepEqual( loadConfigMock.mock.calls[ 0 ].arguments, [ adapterConfig ] );

			assert( context.getInstance( 'Adapter' ) );
		} );
	} );
} );
