/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan, ISourceFolder } from '../SourceStorageAdapter';
import CKBoxClient, { ICKBoxClient, ICKBoxLocation } from '../CKBoxClient';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import Logger, { ILogger } from '../Logger';
import UI, { IUI } from '../UI';

export default class MigrateFoldersTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Migrating folders';

	public readonly successMessage: string = 'Folders migrated';

	public readonly failureMessage: string = 'Folders migration failed';

	public async run( context: MigratorContext ): Promise<void> {
		const client: ICKBoxClient = context.getInstance( CKBoxClient );
		const migrationPlan: IMigrationPlan = context.getInstance( 'MigrationPlan' );
		const logger: ILogger = context.getInstance( Logger );
		const ui: IUI = context.getInstance( UI );
		const migratedCategoriesMap: Map<string, string> = context.getInstance( 'MigratedCategoriesMap' );

		// Folders map: source category ID -> source folder ID -> migrated folder ID
		const migratedFoldersMap: Map<string, Map<string, string>> = new Map();

		for ( const sourceCategory of migrationPlan.categories ) {
			const migratedFoldersForCategory: Map<string, string> = new Map();

			const migratedCategoryId: string | undefined = migratedCategoriesMap.get( sourceCategory.id );

			if ( !migratedCategoryId ) {
				// TODO: Skip, but not abort the migration
				// TODO: Add "failings" flag to the context
				// TODO: Add test for this scenario
				throw new Error( `Category "${ sourceCategory.id }" was not migrated.` );
			}

			for ( const sourceFolder of sourceCategory.folders ) {
				await this._migrateFolder(
					client,
					sourceFolder,
					{ categoryId: migratedCategoryId },
					logger,
					ui,
					migratedFoldersForCategory
				);
			}

			migratedFoldersMap.set( sourceCategory.id, migratedFoldersForCategory );
		}

		context.setInstance( migratedFoldersMap, 'MigratedFoldersMap' );
	}

	private async _migrateFolder(
		client: ICKBoxClient,
		sourceFolder: ISourceFolder,
		location: ICKBoxLocation,
		logger: ILogger,
		ui: IUI,
		migratedFoldersMap: Map<string, string>
	): Promise<void> {
		logger.info( 'Creating folder', { sourceFolderId: sourceFolder.id } );
		ui.spinner( `Creating folder "${ sourceFolder.id }"` );

		const migratedFolderId: string = await client.createFolder( {
			name: sourceFolder.name,
			location
		} );

		logger.info( 'Folder created', { sourceFolderId: sourceFolder.id, migratedFolderId } );

		migratedFoldersMap.set( sourceFolder.id, migratedFolderId );

		for ( const childFolder of sourceFolder.childFolders ) {
			await this._migrateFolder(
				client,
				childFolder,
				{ folderId: migratedFolderId },
				logger,
				ui,
				migratedFoldersMap
			);
		}
	}
}
