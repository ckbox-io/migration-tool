/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';

import { plainToInstance } from 'class-transformer';
import jwt from 'jsonwebtoken';

import { CKBoxConfig } from '@src/Config';
import CKBoxClient from '@src/CKBoxClient';

const CKBOX_API_ORIGIN: string | undefined = process.env.CKBOX_API_ORIGIN;
const CKBOX_API_SECRET: string | undefined = process.env.CKBOX_API_SECRET;
const CKBOX_API_ENVIRONMENT_ID: string | undefined = process.env.CKBOX_API_ENVIRONMENT_ID;

describe( 'CKBoxClient', { skip: _shouldSkipTests() }, () => {
	describe( 'verifyConnection()', () => {
		let _workspaceId: string;

		before( async () => {
			const response: Response = await _ckboxAPICall( 'POST', '/superadmin/workspaces', { name: 'test-workspace' } );

			_workspaceId = ( await response.json() as { id: string } ).id;
		} );

		after( async () => {
			await _ckboxAPICall( 'DELETE', `/superadmin/workspaces/${ _workspaceId }` );
		} );

		it( 'should pass if connection can be established', async () => {
			const config: CKBoxConfig = _createConfig();
			const client: CKBoxClient = new CKBoxClient( config );

			await assert.doesNotReject( async () => {
				await client.verifyConnection();
			} );
		} );

		it( 'should pass if connection to a specific workspace can be established', async () => {
			const config: CKBoxConfig = _createConfig( { workspaceId: _workspaceId } );
			const client: CKBoxClient = new CKBoxClient( config );

			await assert.doesNotReject( async () => {
				await client.verifyConnection();
			} );
		} );

		it( 'should throw an error if connection cannot be established', async () => {
			const config: CKBoxConfig = _createConfig( { environmentId: 'invalid-env-id' } );
			const client: CKBoxClient = new CKBoxClient( config );

			await assert.rejects( async () => {
				await client.verifyConnection();
			} );
		} );

		it( 'should throw an error if the workspace is not accessible', async () => {
			const config: CKBoxConfig = _createConfig( { workspaceId: 'invalid-workspace-id' } );
			const client: CKBoxClient = new CKBoxClient( config );

			await assert.rejects( async () => {
				await client.verifyConnection();
			} );
		} );
	} );
} );

function _createConfig( params?: { environmentId?: string; workspaceId?: string } ): CKBoxConfig {
	return plainToInstance( CKBoxConfig, {
		serviceOrigin: CKBOX_API_ORIGIN,
		accessCredentials: {
			environmentId: params?.environmentId || CKBOX_API_ENVIRONMENT_ID,
			secret: CKBOX_API_SECRET
		},
		workspaceId: params?.workspaceId
	} );
}

function _shouldSkipTests(): string | undefined {
	if ( !CKBOX_API_ORIGIN ) {
		return 'CKBOX_API_ORIGIN environment variable is not set.';
	}

	if ( !CKBOX_API_SECRET ) {
		return 'CKBOX_API_SECRET environment variable is not set.';
	}

	if ( !CKBOX_API_ENVIRONMENT_ID ) {
		return 'CKBOX_API_ENVIRONMENT_ID environment variable is not set.';
	}

	return undefined;
}

async function _ckboxAPICall(
	method: 'GET' | 'POST' | 'DELETE',
	path: string,
	body?: Record<string, unknown>,
	workspaceId?: string
): Promise<Response> {
	const tokenPayload: Record<string, unknown> = {
		iss: 'ckbox-migrator-tests',
		aud: CKBOX_API_ENVIRONMENT_ID,
		sub: 'ckbox-migrator-tests',
		auth: {
			ckbox: {
				role: 'superadmin',
				...( workspaceId ? { workspaces: [ workspaceId ] } : {} )
			}
		}
	};

	const token: string = jwt.sign( tokenPayload, CKBOX_API_SECRET!, {
		algorithm: 'HS256'
	} );

	const url: string = `${ CKBOX_API_ORIGIN }${ path }`;

	const response: Response = await fetch(
		url,
		{
			method,
			headers: {
				Authorization: token
			},
			body: body ? JSON.stringify( body ) : undefined
		}
	);

	if ( !response.ok ) {
		throw new Error( `Failed to fetch data from ${ url }. Status ${ response.status }. ${ await response.text() }` );
	}

	return response;
}

