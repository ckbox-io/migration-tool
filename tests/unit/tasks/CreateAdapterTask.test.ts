/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import CreateAdapterTask from '@src/tasks/CreateAdapterTask';
import { ITask } from '@src/Pipeline';
import { ISourceStorageAdapter } from '@src/SourceStorageAdapter';
import { ILogger } from '@src/Logger';
import { IUI } from '@src/UI';

import {
	createConfigManagerFake,
	createLoggerFake,
	createMigratorConfigFake,
	createSourceStorageAdapterFake,
	createSourceStorageManagerFake,
	createUIFake
} from '../utils/_fakes';
import { IConfigManager } from '@src/ConfigManager';
import { ISourceStorageManager } from '@src/SourceStorageManager';

describe( 'CreateAdapterTask', () => {
	describe( 'run()', () => {
		let adapterFake: ISourceStorageAdapter;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let adapterConfig: Record<string, unknown>;
		let abortController: AbortController;
		let configManagerFake: IConfigManager;
		let sourceStorageManagerFake: ISourceStorageManager;

		beforeEach( () => {
			adapterFake = createSourceStorageAdapterFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			adapterConfig = { foo: 'bar' };
			abortController = new AbortController();

			configManagerFake = createConfigManagerFake( createMigratorConfigFake( adapterConfig ) );
			sourceStorageManagerFake = createSourceStorageManagerFake( adapterFake );
		} );

		it( 'should create an adapter instance', async t => {
			const task: ITask = new CreateAdapterTask( configManagerFake, sourceStorageManagerFake );

			const loadAdapterMock: Mock<Function> = t.mock.method( sourceStorageManagerFake, 'loadAdapter', () => {} );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( loadAdapterMock.mock.callCount(), 1 );
			assert.deepEqual( loadAdapterMock.mock.calls[ 0 ].arguments, [ 'FakeAdapter' ] );
		} );

		it( 'should load the configuration', async t => {
			const task: ITask = new CreateAdapterTask( configManagerFake, sourceStorageManagerFake );

			const loadConfigMock: Mock<Function> = t.mock.method( adapterFake, 'loadConfig' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( loadConfigMock.mock.callCount(), 1 );
			assert.deepEqual( loadConfigMock.mock.calls[ 0 ].arguments, [ adapterConfig ] );
		} );
	} );
} );
