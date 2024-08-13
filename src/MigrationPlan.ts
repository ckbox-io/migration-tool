/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceAsset, ISourceCategory, ISourceFolder } from './SourceStorageAdapter';

export default class MigrationPlan implements IMigrationPlan {
	constructor( public readonly categories: ISourceCategory[], public readonly assets: ISourceAsset[] ) { }

	public getCategoriesCount(): number {
		return this.categories.length;
	}

	public getFoldersCount(): number {
		return this.categories.reduce( ( count, category ) => count + this._countCategoryFolders( category ), 0 );
	}

	public getAssetsCount(): number {
		return this.assets.length;
	}

	private _countCategoryFolders( category: ISourceCategory ): number {
		return category.folders.reduce( ( count, folder ) => count + this._countFoldersInSubtree( folder ), 0 );
	}

	private _countFoldersInSubtree( folder: ISourceFolder ): number {
		return folder.childFolders.reduce( ( count, childFolder ) => count + this._countFoldersInSubtree( childFolder ), 1 );
	}
}
