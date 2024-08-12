/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceFolder } from '../SourceStorageAdapter';
import CKBoxClient, { ICKBoxClient, ICKBoxLocation } from '../CKBoxClient';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import { ILogger } from '../Logger';
import { IUI } from '../UI';
import { IMigratedCategoriesRepository } from '../repositories/MigratedCategoriesRepository';
import { IMigratedFoldersRepository } from '../repositories/MigratedFoldersRepository';

export default class MigrateFoldersTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Migrating folders';

	public readonly successMessage: string = 'Folders migrated';

	public readonly failureMessage: string = 'Folders migration failed';

	public constructor(
		private readonly _migratedCategoriesRepository: IMigratedCategoriesRepository,
		private readonly _migratedFoldersRepository: IMigratedFoldersRepository
	) {}

	public async run( context: MigratorContext, ui: IUI, logger: ILogger ): Promise<void> {
		const client: ICKBoxClient = context.getInstance( CKBoxClient );
		const migrationPlan: IMigrationPlan = context.getInstance( 'MigrationPlan' );

		for ( const sourceCategory of migrationPlan.categories ) {
			const migratedCategoryId: string | null = this._migratedCategoriesRepository.getIdOfMigratedCategory( sourceCategory.id );

			if ( !migratedCategoryId ) {
				logger.error( 'Category has not been migrated.', { sourceCategoryId: sourceCategory.id } );

				continue;
			}

			for ( const sourceFolder of sourceCategory.folders ) {
				await this._migrateFolder(
					client,
					sourceCategory.id,
					sourceFolder,
					{ categoryId: migratedCategoryId },
					logger,
					ui
				);
			}
		}
	}

	private async _migrateFolder(
		client: ICKBoxClient,
		sourceCategoryId: string,
		sourceFolder: ISourceFolder,
		location: ICKBoxLocation,
		logger: ILogger,
		ui: IUI
	): Promise<void> {
		logger.info( 'Creating folder', { sourceFolderId: sourceFolder.id } );
		ui.spinner( `Creating folder "${ sourceFolder.id }"` );

		const migratedFolderId: string = await client.createFolder( {
			name: sourceFolder.name,
			location
		} );

		logger.info( 'Folder created', { sourceFolderId: sourceFolder.id, migratedFolderId } );

		this._migratedFoldersRepository.addMigratedFolder( sourceCategoryId, sourceFolder.id, migratedFolderId );

		for ( const childFolder of sourceFolder.childFolders ) {
			await this._migrateFolder(
				client,
				sourceCategoryId,
				childFolder,
				{ folderId: migratedFolderId },
				logger,
				ui
			);
		}
	}
}
