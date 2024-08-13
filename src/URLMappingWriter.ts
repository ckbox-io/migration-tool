/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import fs, { WriteStream } from 'node:fs';

export interface IURLMappingWriter {
	write( sourceUrl: string, targetUrl: string ): void;
}

export default class URLMappingWriter implements IURLMappingWriter {
	private _stream: WriteStream;

	private _filename: string;

	public constructor() {
		this._filename = `ckbox_mapped_URLs_${ new Date().toISOString().replace( /:/g, '-' ) }.txt`;

		this._stream = fs.createWriteStream( this._filename, { flags: 'a' } );
	}

	public write( sourceUrl: string, targetUrl: string ): void {
		this._stream.write( `${ sourceUrl }\t${ targetUrl }\n` );
	}

	public get filename(): string {
		return this._filename;
	}
}
