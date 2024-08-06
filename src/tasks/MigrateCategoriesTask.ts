/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan } from '../SourceStorageAdapter';
import CKBoxClient, { ICKBoxClient } from '../CKBoxClient';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import Logger, { ILogger } from '../Logger';
import UI, { IUI } from '../UI';

export default class MigrateCategoriesTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Migrating categories';

	public readonly successMessage: string = 'Categories migrated';

	public readonly failureMessage: string = 'Categories migration failed';

	public async run( context: MigratorContext ): Promise<void> {
		const client: ICKBoxClient = context.getInstance( CKBoxClient );
		const migrationPlan: IMigrationPlan = context.getInstance( 'MigrationPlan' );
		const logger: ILogger = context.getInstance( Logger );
		const ui: IUI = context.getInstance( UI );

		const migratedCategoriesMap: Map<string, string> = new Map();

		for ( const category of migrationPlan.categories ) {
			logger.info( 'Creating category', { sourceCategoryId: category.id } );
			ui.spinner( `Creating category "${ category.id }"` );

			const migratedCategoryId: string = await client.createCategory( {
				name: category.name,
				allowedExtensions: category.allowedExtensions
			} );

			logger.info( 'Category created', { sourceCategoryId: category.id, migratedCategoryId } );

			migratedCategoriesMap.set( category.id, migratedCategoryId );
		}

		context.setInstance( migratedCategoriesMap, 'MigratedCategoriesMap' );
	}
}
