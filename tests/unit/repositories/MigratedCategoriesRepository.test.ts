/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigratedCategoriesRepository from '@src/repositories/MigratedCategoriesRepository';

describe( 'MigratedCategoriesRepository', () => {
	describe( 'getIdOfMigratedCategory()', () => {
		it( 'should return null when the category was not migrated', () => {
			const repository = new MigratedCategoriesRepository();

			assert.strictEqual( repository.getIdOfMigratedCategory( 'sourceCategoryId' ), null );
		} );

		it( 'should return the target category ID when the category was migrated', () => {
			const repository = new MigratedCategoriesRepository();

			repository.addMigratedCategory( 'sourceCategoryId', 'targetCategoryId' );

			assert.strictEqual( repository.getIdOfMigratedCategory( 'sourceCategoryId' ), 'targetCategoryId' );
		} );
	} );
} );
