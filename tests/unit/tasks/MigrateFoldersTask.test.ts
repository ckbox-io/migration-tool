/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { Mock, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigrateFoldersTask from '@src/tasks/MigrateFoldersTask';
import { ITask } from '@src/Pipeline';
import { IMigrationPlan, ISourceFolder } from '@src/SourceStorageAdapter';
import { ICKBoxClient } from '@src/CKBoxClient';
import { IUI } from '@src/UI';
import { ILogger } from '@src/Logger';

import {
	createCKBoxClientFake,
	createCKBoxClientManagerFake,
	createLoggerFake,
	createMigratedCategoriesRepositoryFake,
	createMigratedFoldersRepositoryFake,
	createMigrationPlanManagerFake,
	createUIFake
} from '../utils/_fakes';
import MigrationPlan from '@src/MigrationPlan';
import { IMigratedFoldersRepository } from '@src/repositories/MigratedFoldersRepository';
import { IMigratedCategoriesRepository } from '@src/repositories/MigratedCategoriesRepository';
import { IMigrationPlanManager } from '@src/MigrationPlanManager';
import { ICKBoxClientManager } from '@src/CKBoxClientManager';

describe( 'MigrateFoldersTask', () => {
	describe( 'run()', () => {
		let clientFake: ICKBoxClient;
		let uiFake: IUI;
		let loggerFake: ILogger;
		let abortController: AbortController;
		let migrationPlanManager: IMigrationPlanManager;
		let ckboxClientManagerFake: ICKBoxClientManager;
		let migratedCategoriesRepositoryFake: IMigratedCategoriesRepository;
		let migratedFoldersRepositoryFake: IMigratedFoldersRepository;
		let task: ITask;

		beforeEach( () => {
			clientFake = createCKBoxClientFake();
			uiFake = createUIFake();
			loggerFake = createLoggerFake();
			abortController = new AbortController();
			migrationPlanManager = createMigrationPlanManagerFake();
			ckboxClientManagerFake = createCKBoxClientManagerFake( clientFake );

			migratedCategoriesRepositoryFake = createMigratedCategoriesRepositoryFake();
			migratedFoldersRepositoryFake = createMigratedFoldersRepositoryFake();

			task = new MigrateFoldersTask(
				migrationPlanManager,
				ckboxClientManagerFake,
				migratedCategoriesRepositoryFake,
				migratedFoldersRepositoryFake
			);
		} );

		it( 'should migrate folders of a category', async t => {
			const sourceFolders: ISourceFolder[] = [
				{
					id: 'f-1',
					name: 'Foo',
					childFolders: []
				},
				{
					id: 'f-2',
					name: 'Bar',
					childFolders: []
				}
			];

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceFolders );

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			const createFolderMock: Mock<Function> = t.mock.method( clientFake, 'createFolder', () => 'migrated-folder-id' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( createFolderMock.mock.callCount(), 2 );

			assert.deepEqual( createFolderMock.mock.calls[ 0 ].arguments, [ {
				name: 'Foo',
				location: { categoryId: 'migrated-category-id-c-1' }
			} ] );

			assert.deepEqual( createFolderMock.mock.calls[ 1 ].arguments, [ {
				name: 'Bar',
				location: { categoryId: 'migrated-category-id-c-1' }
			} ] );
		} );

		it( 'should migrate child folders', async t => {
			const sourceFolders: ISourceFolder[] = [
				{
					id: 'f-1',
					name: 'Foo',
					childFolders: [
						{
							id: 'f-1-1',
							name: 'Bar',
							childFolders: []
						}
					]
				}
			];

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceFolders );

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			const createFolderMock: Mock<Function> = t.mock.method( clientFake, 'createFolder', () => 'migrated-folder-id' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( createFolderMock.mock.callCount(), 2 );

			assert.deepEqual( createFolderMock.mock.calls[ 0 ].arguments, [ {
				name: 'Foo',
				location: { categoryId: 'migrated-category-id-c-1' }
			} ] );

			assert.deepEqual( createFolderMock.mock.calls[ 1 ].arguments, [ {
				name: 'Bar',
				location: { folderId: 'migrated-folder-id' }
			} ] );
		} );

		it( 'should log the progress', async t => {
			const sourceFolders: ISourceFolder[] = [
				{
					id: 'f-1',
					name: 'Foo',
					childFolders: []
				}
			];

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceFolders );
			const loggerInfoMock: Mock<Function> = t.mock.method( loggerFake, 'info' );

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			t.mock.method( clientFake, 'createFolder', () => 'migrated-folder-id' );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( loggerInfoMock.mock.callCount(), 2 );

			assert.deepEqual( loggerInfoMock.mock.calls[ 0 ].arguments, [ 'Creating folder', { sourceFolderId: 'f-1' } ] );
			assert.deepEqual(
				loggerInfoMock.mock.calls[ 1 ].arguments,
				[
					'Folder created',
					{ sourceFolderId: 'f-1', migratedFolderId: 'migrated-folder-id' }
				]
			);
		} );

		it( 'should store the mapping of source and migrated folders', async t => {
			const sourceFolders: ISourceFolder[] = [
				{
					id: 'f-1',
					name: 'Foo',
					childFolders: []
				}
			];

			const setMigratedFolderMock: Mock<Function> = t.mock.method( migratedFoldersRepositoryFake, 'addMigratedFolder' );

			t.mock.method( clientFake, 'createFolder', () => 'migrated-folder-id' );

			const migrationPlan: IMigrationPlan = _createMigrationPlan( sourceFolders );

			t.mock.method( migrationPlanManager, 'getMigrationPlan', () => migrationPlan );

			await task.run( uiFake, loggerFake, abortController );

			assert.equal( setMigratedFolderMock.mock.callCount(), 1 );
			assert.deepEqual( setMigratedFolderMock.mock.calls[ 0 ].arguments, [ 'c-1', 'f-1', 'migrated-folder-id' ] );
		} );
	} );
} );

function _createMigrationPlan( folders: ISourceFolder[] ): IMigrationPlan {
	return new MigrationPlan(
		[ {
			id: 'c-1',
			name: 'Foo',
			allowedExtensions: [ 'jpg' ],
			folders
		} ],
		[]
	);
}
