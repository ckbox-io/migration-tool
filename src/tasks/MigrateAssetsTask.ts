/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ISourceStorageAdapter } from '../SourceStorageAdapter';
import CKBoxClient, { ICKBoxClient, ICKBoxLocation } from '../CKBoxClient';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import { ILogger } from '../Logger';
import { IUI } from '../UI';
import MigrationPlan from '../MigrationPlan';
import { IURLMappingWriter } from '../URLMappingWriter';
import { IMigratedCategoriesRepository } from '../repositories/MigratedCategoriesRepository';
import { IMigratedFoldersRepository } from '../repositories/MigratedFoldersRepository';

export default class MigrateAssetsTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Migrating assets';

	public readonly successMessage: string = 'Assets migrated';

	public readonly failureMessage: string = 'Assets migration failed';

	public constructor(
		private _urlMappingWriter: IURLMappingWriter,
		private _migratedCategoriesRepository: IMigratedCategoriesRepository,
		private _migratedFoldersRepository: IMigratedFoldersRepository
	) {}

	public async run( context: MigratorContext, ui: IUI, logger: ILogger ): Promise<void> {
		const client: ICKBoxClient = context.getInstance( CKBoxClient );
		const adapter: ISourceStorageAdapter = context.getInstance( 'Adapter' );
		const migrationPlan: MigrationPlan = context.getInstance( MigrationPlan );

		const assetsCount: number = migrationPlan.getAssetsCount();

		let failing: boolean = false;

		for ( const [ index, sourceAsset ] of migrationPlan.assets.entries() ) {
			const { folderId: sourceFolderId, categoryId: sourceCategoryId } = sourceAsset.location;

			try {
				logger.info( 'Migrating asset.', { sourceAssetId: sourceAsset.id } );

				const progress: number = Math.round( ( index / assetsCount ) * 100 );
				const progressMessage: string = `Copying assets: ${ progress }% (processing file ${ index + 1 } of ${ assetsCount })`;

				if ( !failing ) {
					ui.spinner( progressMessage );
				} else {
					ui.warn( progressMessage );
				}

				const location: ICKBoxLocation = this._getMigratedLocation( sourceCategoryId, sourceFolderId );

				const stream = await adapter.getAsset( sourceAsset.downloadUrl );
				const { id: migratedAssetId, url } = await client.uploadAsset( {
					name: `${ sourceAsset.name }.${ sourceAsset.extension }`,
					location,
					stream
				} );

				logger.info( 'Asset migrated.', { sourceAssetId: sourceAsset.id, migratedAssetId } );

				this._urlMappingWriter.write( sourceAsset.downloadUrlToReplace, url );
			} catch ( error ) {
				logger.error( 'Asset migration failed.', { sourceAssetId: sourceAsset.id, error } );

				failing = true;
			}

			if ( failing ) {
				throw new Error( 'Some assets migration failed.' );
			}
		}
	}

	private _getMigratedLocation( sourceCategoryId: string, sourceFolderId?: string ): ICKBoxLocation {
		const migratedCategoryId: string | null = this._migratedCategoriesRepository.getIdOfMigratedCategory( sourceCategoryId );

		if ( !migratedCategoryId ) {
			throw new Error( `Category ${ sourceCategoryId } was not migrated.` );
		}

		if ( !sourceFolderId ) {
			return { categoryId: migratedCategoryId };
		}

		const migratedFolderId: string | null = this._migratedFoldersRepository.getIdOfMigratedFolder(
			sourceCategoryId,
			sourceFolderId
		);

		if ( !migratedFolderId ) {
			throw new Error( `Folder ${ sourceFolderId } was not migrated.` );
		}

		return { folderId: migratedFolderId };
	}
}
