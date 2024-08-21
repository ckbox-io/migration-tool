/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan } from '../SourceStorageAdapter';
import { ICKBoxClient } from '../CKBoxClient';
import { ITask } from '../Pipeline';
import { ILogger } from '../Logger';
import { IUI } from '../UI';
import { IMigratedCategoriesRepository } from '../repositories/MigratedCategoriesRepository';
import { ICKBoxClientManager } from '../CKBoxClientManager';
import { IMigrationPlanManager } from '../MigrationPlanManager';

export default class MigrateCategoriesTask implements ITask {
	public readonly processingMessage: string = 'Migrating categories';

	public readonly successMessage: string = 'Categories migrated';

	public readonly failureMessage: string = 'Categories migration failed';

	public constructor(
		private readonly _migrationPlanManager: IMigrationPlanManager,
		private readonly _ckboxClientManager: ICKBoxClientManager,
		private readonly _migratedCategoriesRepository: IMigratedCategoriesRepository
	) {}

	public async run( ui: IUI, logger: ILogger ): Promise<void> {
		const ckboxClient: ICKBoxClient = this._ckboxClientManager.getClient();
		const migrationPlan: IMigrationPlan = this._migrationPlanManager.getMigrationPlan();

		for ( const category of migrationPlan.categories ) {
			logger.info( 'Creating category', { sourceCategoryId: category.id } );
			ui.spinner( `Creating category "${ category.id }"` );

			const migratedCategoryId: string = await ckboxClient.createCategory( {
				name: category.name,
				allowedExtensions: category.allowedExtensions
			} );

			logger.info( 'Category created', { sourceCategoryId: category.id, migratedCategoryId } );

			this._migratedCategoriesRepository.addMigratedCategory( category.id, migratedCategoryId );
		}
	}
}
