/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import fs, { WriteStream } from 'node:fs';
import { unlink } from 'node:fs/promises';

export interface ILogger {
	info( message: string, data?: Record<string, unknown> ): void;
	warn( message: string, data?: Record<string, unknown> | Error ): void;
	error( message: string, data?: Record<string, unknown> | Error ): void;
	child( name: string ): ILogger;
}

export default class Logger implements ILogger {
	private _stream: WriteStream;

	private _filename: string;

	public constructor( private _name: string, stream?: WriteStream ) {
		this._filename = `ckbox_migrator_${ new Date().toISOString().replace( /:/g, '-' ) }.log`;

		this._stream = stream ?? fs.createWriteStream( this._filename, { flags: 'a' } );
	}

	public get filename(): string {
		return this._filename;
	}

	public info( message: string, data?: Record<string, unknown> ): void {
		this._log( 'info', message, data );
	}

	public warn( message: string, data?: Record<string, unknown> | Error ): void {
		this._log( 'warn', message, data );
	}

	public error( message: string, data?: Record<string, unknown> | Error ): void {
		this._log( 'error', message, data );
	}

	public child( name: string ): ILogger {
		return new Logger( name, this._stream );
	}

	public async removeLogFile(): Promise<void> {
		this._stream.end();

		await unlink( this._filename );
	}

	private _log( level: string, message: string, data?: Record<string, unknown> | Error ): void {
		const timestamp: string = new Date().toISOString();

		this._stream.write( `[${ timestamp }] [${ level.toUpperCase() }] [${ this._name }] ${ message }${ this._formatData( data ) }\n` );
	}

	private _formatData( data?: Record<string, unknown> | Error ): string {
		if ( !data ) {
			return '';
		}

		if ( data instanceof Error ) {
			data = this._getErrorData( data );
		}

		if ( data.error instanceof Error ) {
			data = { ...data, ...this._getErrorData( data.error ) };
		}

		return ' ' + Object.keys( data ).map( key => `${ key }=${ data[ key ] }` ).join( ', ' );
	}

	private _getErrorData( error: Error ): Record<string, unknown> {
		const cause: Error | undefined = ( error.cause ) as Error;

		return {
			error: error.stack || error.message,
			...error.cause ? { cause: cause?.stack ?? cause?.message } : {}
		};
	}
}
