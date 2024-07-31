/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

export interface ISourceStorageAdapter {

	readonly name: string;

	/**
	 * Initializes the adapter with the given configuration.
	 */
	loadConfig( config: Record<string, unknown> ): Promise<void>;

	/**
	 * Verifies if the connection to the source storage is possible.
	 */
	verifyConnection(): Promise<void>;

	/**
	 * Analyzes the source storage and returns a migration plan.
	 */
	analyzeStorage(): Promise<IMigrationPlan>;

	/**
	 * Downloads the asset from the source storage.
	 */
	getAsset( downloadUrl: string ): Promise<NodeJS.ReadableStream>;
}

export interface IMigrationPlan {

	/**
	 * Categories that should be created in the CKBox.
	 */
	readonly categories: ISourceCategory[];

	/**
	 * Assets that should be created in the CKBox.
	 */
	readonly assets: ISourceAsset[];
}

export interface ISourceCategory {

	/**
	 * Unique identifier of the category.
	 */
	readonly id: string;

	/**
	 * Name of the category.
	 */
	readonly name: string;

	/**
	 * Allowed extensions for the category.
	 */
	readonly allowedExtensions: string[];

	/**
	 * Child folders of the category.
	 */
	readonly folders: ISourceFolder[];
}

export interface ISourceFolder {

	/**
	 * Unique identifier of the folder.
	 */
	readonly id: string;

	/**
	 * Name of the folder.
	 */
	readonly name: string;

	/**
	 * Child folders of the folder.
	 */
	readonly childFolders: ISourceFolder[];
}

export interface ISourceLocation {
	categoryId: string;

	folderId?: string;
}

export interface ISourceAsset {

	/**
	 * Unique identifier of the asset.
	 */
	readonly id: string;

	/**
	 * URL to download the asset by ISourceStorageAdapter.
	 */
	readonly downloadUrl: string;

	/**
	 * Name of the asset (filename).
	 */
	readonly name: string;

	/**
	 * Extension of the asset.
	 */
	readonly extension: string;

	/**
	 * Location where the asset should be stored.
	 */
	readonly location: ISourceLocation;

	/**
	 * URL that should be replaced in the content.
	 */
	readonly downloadUrlToReplace: string;
}
