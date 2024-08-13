/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceFolder } from '../SourceStorageAdapter';
import { ICKBoxClient, ICKBoxLocation } from '../CKBoxClient';
import { ITask } from '../Pipeline';
import { ILogger } from '../Logger';
import { IUI } from '../UI';
import { IMigratedCategoriesRepository } from '../repositories/MigratedCategoriesRepository';
import { IMigratedFoldersRepository } from '../repositories/MigratedFoldersRepository';
import { ICKBoxClientManager } from '../CKBoxClientManager';
import { IMigrationPlanManager } from '../MigrationPlanManager';

export default class MigrateFoldersTask implements ITask {
	public readonly processingMessage: string = 'Migrating folders';

	public readonly successMessage: string = 'Folders migrated';

	public readonly failureMessage: string = 'Folders migration failed';

	public constructor(
		private readonly _migrationPlanManager: IMigrationPlanManager,
		private readonly _ckboxClientManager: ICKBoxClientManager,
		private readonly _migratedCategoriesRepository: IMigratedCategoriesRepository,
		private readonly _migratedFoldersRepository: IMigratedFoldersRepository
	) {}

	public async run( ui: IUI, logger: ILogger ): Promise<void> {
		const client: ICKBoxClient = this._ckboxClientManager.getClient();
		const migrationPlan: IMigrationPlan = this._migrationPlanManager.getMigrationPlan();

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
