/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import fs, { WriteStream } from 'node:fs';
import { ISourceResponsiveImage } from './SourceStorageAdapter';

export interface IURLMappingWriter {
	write( sourceUrl: string, responsiveImages: ISourceResponsiveImage[], targetUrl: string ): void;
}

export default class URLMappingWriter implements IURLMappingWriter {
	private _stream: WriteStream;

	private _filename: string;

	public constructor() {
		this._filename = `ckbox_mapped_URLs_${ new Date().toISOString().replace( /:/g, '-' ) }.txt`;

		this._stream = fs.createWriteStream( this._filename, { flags: 'a' } );
	}

	public write( sourceUrl: string, responsiveImages: ISourceResponsiveImage[], targetUrlFile: string ): void {
		const targetUrl: string = targetUrlFile.replace( /\/file$/, '' );

		// Todo: Implement responsive images
		for ( const responsiveImage of responsiveImages ) {
			this._stream.write( `${ responsiveImage.url }\t${ targetUrl }/images/${ responsiveImage.width }.webp\n` );
		}

		this._stream.write( `${ sourceUrl }\t${ targetUrlFile }\n` );
	}

	public get filename(): string {
		return this._filename;
	}
}
