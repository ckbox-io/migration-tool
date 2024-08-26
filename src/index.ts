/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

// This file exposes the public API needed to implement a custom source storage adapter.

import { requireESM } from './ESMHelpers';
import {
	ISourceStorageAdapter,
	IMigrationPlan,
	ISourceCategory,
	ISourceFolder,
	ISourceAsset,
	IGetAssetResult,
	ISourceResponsiveImage
} from './SourceStorageAdapter';
import { ILogger } from './Logger';

export {
	ISourceStorageAdapter,
	IMigrationPlan,
	ISourceCategory,
	ISourceFolder,
	ISourceAsset,
	IGetAssetResult,
	ISourceResponsiveImage,
	ILogger,
	requireESM
};
