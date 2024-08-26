/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

export const PERCENTAGE_THRESHOLD: number = 10;
export const PIXELS_THRESHOLD: number = 80;

export default class ImagesSizesProvider {
	public getResponsiveWidths( originalWidth: number): number[] {
		const imageSizesCountByPixels: number = originalWidth / PIXELS_THRESHOLD;
		const calculateParamsUsingPercentageThreshold: boolean = imageSizesCountByPixels >= ( 100 / PERCENTAGE_THRESHOLD );

		if ( calculateParamsUsingPercentageThreshold ) {
			return this._getParamsByPercentageThreshold( originalWidth, PERCENTAGE_THRESHOLD );
		}

		return this._getParamsByPixelsThreshold( originalWidth, PIXELS_THRESHOLD );
	}

	private _getParamsByPercentageThreshold( originalWidth: number, threshold: number ): number[] {
		const params: number[] = [ originalWidth ];

		for ( let i: number = threshold; i <= 100 - threshold; i += threshold ) {
			const width: number = Math.ceil( originalWidth / 100 ) * i;

			params.push( width );
		}

		return params;
	}

	private _getParamsByPixelsThreshold( originalWidth: number, threshold: number ): number[] {
		const params: number[] = [ originalWidth ];

		for ( let i: number = threshold; i <= originalWidth - threshold; i += threshold ) {
			const width: number = Math.ceil( originalWidth - i );

			params.push( width );
		}

		return params;
	}
}
