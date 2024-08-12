/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan } from '../SourceStorageAdapter';
import CKBoxClient, { ICKBoxClient } from '../CKBoxClient';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import { ILogger } from '../Logger';
import { IUI } from '../UI';
import { IMigratedCategoriesRepository } from '../repositories/MigratedCategoriesRepository';

export default class MigrateCategoriesTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Migrating categories';

	public readonly successMessage: string = 'Categories migrated';

	public readonly failureMessage: string = 'Categories migration failed';

	public constructor( private readonly _migratedCategoriesRepository: IMigratedCategoriesRepository ) {}

	public async run( context: MigratorContext, ui: IUI, logger: ILogger ): Promise<void> {
		const client: ICKBoxClient = context.getInstance( CKBoxClient );
		const migrationPlan: IMigrationPlan = context.getInstance( 'MigrationPlan' );

		for ( const category of migrationPlan.categories ) {
			logger.info( 'Creating category', { sourceCategoryId: category.id } );
			ui.spinner( `Creating category "${ category.id }"` );

			const migratedCategoryId: string = await client.createCategory( {
				name: category.name,
				allowedExtensions: category.allowedExtensions
			} );

			logger.info( 'Category created', { sourceCategoryId: category.id, migratedCategoryId } );

			this._migratedCategoriesRepository.addMigratedCategory( category.id, migratedCategoryId );
		}
	}
}
