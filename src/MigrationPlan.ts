/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceAsset, ISourceCategory } from './SourceStorageAdapter';

export default class MigrationPlan implements IMigrationPlan {
	constructor( public readonly categories: ISourceCategory[], public readonly assets: ISourceAsset[] ) { }

	public getCategoriesCount(): number {
		return this.categories.length;
	}

	public getFoldersCount(): number {
		return this.categories.reduce( ( count, category ) => count + category.folders.length, 0 );
	}

	public getAssetsCount(): number {
		return this.assets.length;
	}
}
