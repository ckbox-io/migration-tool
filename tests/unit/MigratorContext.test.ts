/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import MigratorContext from '@src/MigratorContext';

class TestClassA {
	public constructor( public a: string ) {}
}

class TestClassB {
	public constructor( public b: string ) {}
}

describe( 'MigratorContext', () => {
	describe( 'setInstance()', () => {
		it( 'should set an instance of an object in the context', () => {
			const context = new MigratorContext();

			const instanceA: TestClassA = new TestClassA( 'test' );
			const instanceB: TestClassB = new TestClassB( 'test' );

			context.setInstance( instanceA );
			context.setInstance( instanceB );

			assert.strictEqual( context.getInstance( TestClassA ), instanceA );
			assert.strictEqual( context.getInstance( TestClassB ), instanceB );
		} );

		it( 'should set an instance of an object in the context with a custom key', () => {
			const context = new MigratorContext();

			const instanceA: TestClassA = new TestClassA( 'test' );

			context.setInstance( instanceA, 'customKey' );

			assert.strictEqual( context.getInstance( 'customKey' ), instanceA );
		} );

		it( 'should throw an error when trying to reassign an instance of a class', () => {
			const context = new MigratorContext();

			const instance: TestClassA = new TestClassA( 'test' );

			context.setInstance( instance );

			assert.throws( () => {
				context.setInstance( instance );
			}, {
				message: 'The instance of TestClassA is already set.'
			} );
		} );
	} );

	describe( 'getInstance()', () => {
		it( 'should throw an error when trying to get an instance of a class that was not set', () => {
			const context = new MigratorContext();

			assert.throws( () => {
				context.getInstance( TestClassA );
			}, {
				message: 'The instance of TestClassA is not set.'
			} );
		} );
	} );
} );
