/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

export type ClassConstructor<T> = NewableFunction & { prototype: T };

export interface IMigratorContext {
	setInstance<T extends object>( instance: T, key?: string ): void;
	getInstance<T extends object>( key: ClassConstructor<T> | string ): T;
}

export default class MigratorContext implements IMigratorContext {
	private readonly _instances: Map<string, unknown> = new Map();

	public setInstance<T extends object>( instance: T, key?: string ): void {
		const type = instance.constructor as ClassConstructor<T>;
		const resolvedKey = key ?? type.name;

		if ( this._instances.has( resolvedKey ) ) {
			throw new Error( `The instance of ${ type.name } is already set.` );
		}

		this._instances.set( resolvedKey, instance );
	}

	public getInstance<T>( key: ClassConstructor<T> | string ): T {
		const resolvedKey: string = typeof key === 'string' ? key : key.name;

		const instance = this._instances.get( resolvedKey );

		if ( !instance ) {
			throw new Error( `The instance of ${ resolvedKey } is not set.` );
		}

		return instance as T;
	}
}
