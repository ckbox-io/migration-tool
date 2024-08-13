/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { ISourceStorageAdapter } from '../SourceStorageAdapter';
import MigratorContext from '../MigratorContext';
import { ITask } from '../Pipeline';
import MigrationPlan from '../MigrationPlan';
import { IUI } from '../UI';

export default class CreateMigrationPlanTask implements ITask<MigratorContext> {
	public readonly processingMessage: string = 'Creating migration plan';

	public readonly successMessage: string = 'Migration plan created';

	public readonly failureMessage: string = 'Migration plan creation failed';

	public constructor( private _urlMappingFilename: string ) {}

	public async run( context: MigratorContext, ui: IUI ): Promise<void> {
		const adapter: ISourceStorageAdapter = context.getInstance( 'Adapter' );

		const { categories, assets } = await adapter.prepareMigrationPlan();
		const migrationPlan: MigrationPlan = new MigrationPlan( categories, assets );

		const categoriesCount: number = migrationPlan.getCategoriesCount();
		const foldersCount: number = migrationPlan.getFoldersCount();
		const assetsCount: number = migrationPlan.getAssetsCount();
		const categoriesString: string = `${ categoriesCount } ${ categoriesCount === 1 ? 'category' : 'categories' }`;
		const foldersString: string = `${ foldersCount } ${ foldersCount === 1 ? 'folder' : 'folders' }`;
		const assetsString: string = `${ assetsCount } ${ assetsCount === 1 ? 'file' : 'files' }`;
		const categoriesNames: string = categories.map( category => category.name ).join( ', ' );

		ui.info(
			'This tool will migrate files from the source storage using following steps:\n' +
			` - create asset categories in CKBox (${ categoriesString } will be created: ${ categoriesNames })\n` +
			` - copy folder structure to CKBox (${ foldersString } will be created)\n` +
			` - copy files to CKBox (${ assetsString } will be copied)\n` +
			` - save the map of old and new file URLs (the map will be saved in ${ this._urlMappingFilename })\n`
		);

		context.setInstance( migrationPlan );
	}
}
