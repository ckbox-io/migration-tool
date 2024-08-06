/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IAdapterFactory } from '../AdapterFactory';
import { MigratorConfig } from '../Config';
import { IMigratorContext } from '../MigratorContext';
import { ITask } from '../Pipeline';
import { ISourceStorageAdapter } from '../SourceStorageAdapter';

export default class CreateAdapterTask implements ITask<IMigratorContext> {
	public constructor( private readonly _adapterFactory: IAdapterFactory ) {}

	public readonly processingMessage: string = 'Creating adapter';

	public readonly successMessage: string = 'Adapter created';

	public readonly failureMessage: string = 'Adapter creation failed';

	public async run( context: IMigratorContext ): Promise<void> {
		const config: MigratorConfig = context.getInstance( MigratorConfig );

		const adapter: ISourceStorageAdapter = await this._adapterFactory.createAdapter( config.source.type );

		await adapter.loadConfig( config.source.options );

		context.setInstance( adapter, 'Adapter' );
	}
}
