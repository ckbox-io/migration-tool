/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

export interface IMigratedFoldersRepository {
	getIdOfMigratedFolder( categoryId: string, sourceFolderId: string ): string | null;

	addMigratedFolder( categoryId: string, sourceFolderId: string, targetFolderId: string ): void;
}

export default class MigratedFoldersRepository implements IMigratedFoldersRepository {
	private _migratedFolders: Map<string, Map<string, string>> = new Map();

	public getIdOfMigratedFolder( categoryId: string, sourceFolderId: string ): string | null {
		const categoryMap = this._migratedFolders.get( categoryId );

		if ( !categoryMap ) {
			return null;
		}

		return categoryMap.get( sourceFolderId ) || null;
	}

	public addMigratedFolder( categoryId: string, sourceFolderId: string, targetFolderId: string ): void {
		let categoryMap = this._migratedFolders.get( categoryId );

		if ( !categoryMap ) {
			categoryMap = new Map();
			this._migratedFolders.set( categoryId, categoryMap );
		}

		categoryMap.set( sourceFolderId, targetFolderId );
	}
}
