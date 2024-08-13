/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import CKBoxClient, { ICKBoxClient } from './CKBoxClient';
import { CKBoxConfig } from './Config';

export interface ICKBoxClientManager {
	createClient( config: CKBoxConfig ): void;

	getClient(): ICKBoxClient;
}

export default class CKBoxClientManager implements ICKBoxClientManager {
	private _client: ICKBoxClient;

	public createClient( config: CKBoxConfig ): void {
		if ( this._client ) {
			throw new Error( 'CKBox client already created.' );
		}

		this._client = new CKBoxClient( config );
	}

	public getClient(): ICKBoxClient {
		if ( !this._client ) {
			throw new Error( 'CKBox client not created.' );
		}

		return this._client;
	}
}
