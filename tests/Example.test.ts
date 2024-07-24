/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import Example from '@src/Example';

describe( 'Example', () => {
	it( 'foo(): should do sth', () => {
		const e: Example = new Example();

		e.foo();
	} );
} );
