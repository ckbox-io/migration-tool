/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

export interface IMigratedCategoriesRepository {
	getIdOfMigratedCategory( sourceCategoryId: string ): string | null;

	addMigratedCategory( sourceCategoryId: string, targetCategoryId: string ): void;
}

export default class MigratedCategoriesRepository implements IMigratedCategoriesRepository {
	private _migratedCategories: Map<string, string> = new Map();

	public getIdOfMigratedCategory( sourceCategoryId: string ): string | null {
		return this._migratedCategories.get( sourceCategoryId ) || null;
	}

	public addMigratedCategory( sourceCategoryId: string, targetCategoryId: string ): void {
		this._migratedCategories.set( sourceCategoryId, targetCategoryId );
	}
}
