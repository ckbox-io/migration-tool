/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigratedFoldersRepository from '@src/repositories/MigratedFoldersRepository';

describe( 'MigratedFoldersRepository', () => {
	describe( 'getIdOfMigratedFolder()', () => {
		it( 'should return null when the folder was not migrated', () => {
			const repository = new MigratedFoldersRepository();

			assert.strictEqual( repository.getIdOfMigratedFolder( 'categoryId', 'sourceFolderId' ), null );
		} );

		it( 'should return the target folder ID when the folder was migrated', () => {
			const repository = new MigratedFoldersRepository();

			repository.addMigratedFolder( 'categoryId', 'sourceFolderId', 'targetFolderId' );

			assert.strictEqual( repository.getIdOfMigratedFolder( 'categoryId', 'sourceFolderId' ), 'targetFolderId' );
		} );

		it( 'should differentiate between folders from different categories', () => {
			const repository = new MigratedFoldersRepository();

			repository.addMigratedFolder( 'categoryId1', 'sourceFolderId', 'targetFolderId' );

			assert.strictEqual( repository.getIdOfMigratedFolder( 'categoryId1', 'sourceFolderId' ), 'targetFolderId' );
			assert.strictEqual( repository.getIdOfMigratedFolder( 'categoryId2', 'sourceFolderId' ), null );
		} );
	} );
} );
