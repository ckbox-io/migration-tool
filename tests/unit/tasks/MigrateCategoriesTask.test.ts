/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigrateCategoriesTask from '@src/tasks/MigrateCategoriesTask';
import MigratorContext from '@src/MigratorContext';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan } from '@src/SourceStorageAdapter';
import CKBoxClient, { ICKBoxCategory, ICKBoxClient } from '@src/CKBoxClient';
import UI, { IUI } from '@src/UI';
import Logger, { ILogger } from '@src/Logger';

import { createCKBoxClientFake, createLoggerFake, createUIFake } from '../utils/_fakes';
import MigrationPlan from '@src/MigrationPlan';

describe( 'MigrateCategoriesTask', () => {
	describe( 'run()', () => {
		let context: MigratorContext;
		let clientFake: ICKBoxClient;
		let migrationPlan: IMigrationPlan;
		let uiFake: IUI;
		let loggerFake: ILogger;

		beforeEach( () => {
			context = new MigratorContext();

			clientFake = createCKBoxClientFake();

			uiFake = createUIFake();

			loggerFake = createLoggerFake();

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

			context.setInstance( clientFake, CKBoxClient.name );
			context.setInstance( migrationPlan, 'MigrationPlan' );
			context.setInstance( uiFake, UI.name );
			context.setInstance( loggerFake, Logger.name );
		} );

		it( 'should create categories', async t => {
			const task: ITask<MigratorContext> = new MigrateCategoriesTask();

			const createCategoryMock: Mock<Function> = t.mock.method( clientFake, 'createCategory', ( category: ICKBoxCategory ) => (
				Promise.resolve( 'target-id-' + category.name )
			) );

			await task.run( context );

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
			const task: ITask<MigratorContext> = new MigrateCategoriesTask();

			t.mock.method( clientFake, 'createCategory', ( category: ICKBoxCategory ) => (
				Promise.resolve( 'target-id-' + category.name )
			) );

			await task.run( context );

			const categoryMap: Map<string, string> = context.getInstance( 'MigratedCategoriesMap' );

			assert.equal( categoryMap.size, 2 );
			assert.equal( categoryMap.get( 'c-1' ), 'target-id-Foo' );
			assert.equal( categoryMap.get( 'c-2' ), 'target-id-Bar' );
		} );

		it( 'should notify about created categories', async t => {
			const task: ITask<MigratorContext> = new MigrateCategoriesTask();

			t.mock.method( clientFake, 'createCategory', ( category: ICKBoxCategory ) => (
				Promise.resolve( 'target-id-' + category.name )
			) );

			const infoLogMock: Mock<Function> = t.mock.method( loggerFake, 'info' );
			const spinnerMock: Mock<Function> = t.mock.method( uiFake, 'spinner' );

			await task.run( context );

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
