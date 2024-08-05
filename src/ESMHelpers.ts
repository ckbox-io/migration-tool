/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import module from 'node:module';

export function requireESM<T>( packageName: string, currentModule: module ): Promise<T> {
	// @ts-expect-error https://stackoverflow.com/questions/46346502/require-resolve-works-why-doesnt-module-parent-require-resolve
	const pathPackage: string = module._resolveFilename( packageName, currentModule );

	// Important: do not use template string eval(`import("${pathPackage}")`) TS transpile it to require
	// eslint-disable-next-line no-eval
	return ( eval( 'import("' + pathPackage + '")' ) );
}
