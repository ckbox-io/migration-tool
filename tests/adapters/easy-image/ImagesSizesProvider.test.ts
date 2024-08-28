/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import ImagesSizesProvider from '@adapters/easy-image/ImagesSizesProvider';

describe( 'ImagesSizesProvider', () => {
	it( 'getResponsiveWidths(): should calculate widths using percentage threshold', () => {
		const imageSizesProvider: ImagesSizesProvider = new ImagesSizesProvider();

		const responsiveWidths: number[] = imageSizesProvider.getResponsiveWidths( 1000 );

		assert.deepEqual( responsiveWidths, [
			1000,
			100,
			200,
			300,
			400,
			500,
			600,
			700,
			800,
			900
		] );
	} );

	it( 'getParams(): should calculate widths using pixels threshold', () => {
		const imageSizesProvider: ImagesSizesProvider = new ImagesSizesProvider();

		const responsiveWidths: number[] = imageSizesProvider.getResponsiveWidths( 750 );

		assert.deepEqual( responsiveWidths, [
			750,
			670,
			590,
			510,
			430,
			350,
			270,
			190,
			110
		] );
	} );
} );
