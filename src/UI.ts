/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import readline from 'node:readline/promises';
import process from 'node:process';

import type { Options, Ora } from 'ora';

import { requireESM } from './ESMHelpers';

const INDENT_WIDTH: number = 2;

export interface IUI {
	info( message: string ): void;
	warn( message: string ): void;
	spinner( message: string ): void;
	succeed( message?: string ): void;
	fail( message?: string ): void;
	prompt( message: string ): Promise<string>;
	addIndent( indent?: number ): void;
	clearIndent(): void;
}

export default class UI implements IUI {
	private _spinner: Ora;
	private _indent: number = 0;

	private constructor( ora: ( oraOptions?: Options ) => Ora ) {
		this._spinner = ora( { spinner: 'dots' } );
	}

	// TODO: stop spinner on exit

	public info( message: string ): void {
		this._spinner.info( message );
	}

	public warn( message: string ): void {
		this._spinner.warn( message );
	}

	public spinner( message: string ): void {
		this._spinner.start( message );
	}

	public succeed( message?: string ): void {
		this._spinner.succeed( message );
	}

	public fail( message?: string ): void {
		this._spinner.fail( message );
	}

	public async prompt( message: string ): Promise<string> {
		const rl = readline.createInterface( process.stdin, process.stdout );

		return await rl.question( message );
	}

	public static async create(): Promise<UI> {
		const { default: ora } = await requireESM<typeof import( 'ora' )>( 'ora', module );

		return new UI( ora );
	}

	public addIndent( indent?: number ): void {
		this._indent += indent ?? 1;
		this._indent = this._indent >= 0 ? this._indent : 0;
		this._spinner.indent = this._indent * INDENT_WIDTH;
	}

	public clearIndent(): void {
		this._indent = 0;
		this._spinner.indent = 0;
	}
}
