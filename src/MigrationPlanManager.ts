/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { IMigrationPlan } from './SourceStorageAdapter';
import MigrationPlan from './MigrationPlan';

export interface IMigrationPlanManager {
	createMigrationPlan( migrationPlan: IMigrationPlan ): void;
	getMigrationPlan(): MigrationPlan;
}

export default class MigrationPlanManager implements IMigrationPlanManager {
	private _migrationPlan: MigrationPlan | undefined;

	public createMigrationPlan( { categories, assets }: IMigrationPlan ): void {
		if ( this._migrationPlan ) {
			throw new Error( 'Migration plan already exists.' );
		}

		this._migrationPlan = new MigrationPlan( categories, assets );
	}

	public getMigrationPlan(): MigrationPlan {
		if ( !this._migrationPlan ) {
			throw new Error( 'Migration plan does not exist.' );
		}

		return this._migrationPlan;
	}
}
