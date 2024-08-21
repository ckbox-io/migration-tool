/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigrateCategoriesTask from '@src/tasks/MigrateCategoriesTask';
import { ITask } from '@src/Pipeline';
import { ICKBoxCategory, ICKBoxClient } from '@src/CKBoxClient';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

import {
	createCKBoxClientFake,
	createCKBoxClientManagerFake,
	createLoggerFake,
	createMigratedCategoriesRepositoryFake,
	createMigrationPlanManagerFake,
	createUIFake
} from '../utils/_fakes';
import MigrationPlan from '@src/MigrationPlan';
import { IMigratedCategoriesRepository } from '@src/repositories/MigratedCategoriesRepository';
import { ICKBoxClientManager } from '@src/CKBoxClientManager';
import { IMigrationPlanManager } from '@src/MigrationPlanManager';

describe( 'MigrateCategoriesTask', () => {
	describe( 'run()', () => {
		let clientFake: ICKBoxClient;
		let migrationPlan: MigrationPlan;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;
		let migrationPlanManager: IMigrationPlanManager;
		let ckboxClientManagerFake: ICKBoxClientManager;
		let migratedCategoriesRepositoryFake: IMigratedCategoriesRepository;
		let task: ITask;

		beforeEach( () => {
			clientFake = createCKBoxClientFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			migratedCategoriesRepositoryFake = createMigratedCategoriesRepositoryFake();
			abortController = new AbortController();

			migrationPlan = new MigrationPlan(
				[
					{
						id: 'c-1',
						name: 'Foo',
						allowedExtensions: [ 'jpg' ],
						folders: []
					},
					{
						id: 'c-2',
						name: 'Bar',
						allowedExtensions: [ 'png' ],
						folders: []
					}
				],
				[]
			);

			migrationPlanManager = createMigrationPlanManagerFake( migrationPlan );
			ckboxClientManagerFake = createCKBoxClientManagerFake( clientFake );

			task = new MigrateCategoriesTask(
				migrationPlanManager,
				ckboxClientManagerFake,
				migratedCategoriesRepositoryFake
			);
		} );

		it( 'should create categories', async t => {
			const createCategoryMock: Mock<Function> = t.mock.method( clientFake, 'createCategory', ( category: ICKBoxCategory ) => (
				Promise.resolve( 'target-id-' + category.name )
			) );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( createCategoryMock.mock.callCount(), 2 );
			assert.deepEqual( createCategoryMock.mock.calls[ 0 ].arguments, [
				{
					name: 'Foo',
					allowedExtensions: [ 'jpg' ]
				}
			] );

			assert.deepEqual( createCategoryMock.mock.calls[ 1 ].arguments, [
				{
					name: 'Bar',
					allowedExtensions: [ 'png' ]
				}
			] );
		} );

		it( 'should create map of source and migrated category IDs', async t => {
			t.mock.method( clientFake, 'createCategory', ( category: ICKBoxCategory ) => (
				Promise.resolve( 'target-id-' + category.name )
			) );

			const addMigratedCategoryMock: Mock<Function> = t.mock.method( migratedCategoriesRepositoryFake, 'addMigratedCategory' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( addMigratedCategoryMock.mock.callCount(), 2 );
			assert.deepEqual( addMigratedCategoryMock.mock.calls[ 0 ].arguments, [ 'c-1', 'target-id-Foo' ] );
			assert.deepEqual( addMigratedCategoryMock.mock.calls[ 1 ].arguments, [ 'c-2', 'target-id-Bar' ] );
		} );

		it( 'should notify about created categories', async t => {
			t.mock.method( clientFake, 'createCategory', ( category: ICKBoxCategory ) => (
				Promise.resolve( 'target-id-' + category.name )
			) );

			const infoLogMock: Mock<Function> = t.mock.method( loggerFake, 'info' );
			const spinnerMock: Mock<Function> = t.mock.method( uiFake, 'spinner' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( infoLogMock.mock.callCount(), 4 );
			assert.deepEqual( infoLogMock.mock.calls[ 0 ].arguments, [ 'Creating category', { sourceCategoryId: 'c-1' } ] );
			assert.deepEqual( infoLogMock.mock.calls[ 1 ].arguments, [
				'Category created',
				{ sourceCategoryId: 'c-1', migratedCategoryId: 'target-id-Foo' }
			] );
			assert.deepEqual( infoLogMock.mock.calls[ 2 ].arguments, [ 'Creating category', { sourceCategoryId: 'c-2' } ] );
			assert.deepEqual( infoLogMock.mock.calls[ 3 ].arguments, [
				'Category created',
				{ sourceCategoryId: 'c-2', migratedCategoryId: 'target-id-Bar' }
			] );
			assert.equal( spinnerMock.mock.callCount(), 2 );
			assert.deepEqual( spinnerMock.mock.calls[ 0 ].arguments, [ 'Creating category "c-1"' ] );
			assert.deepEqual( spinnerMock.mock.calls[ 1 ].arguments, [ 'Creating category "c-2"' ] );
		} );
	} );
} );
