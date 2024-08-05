// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
	files: [ 'src/**/*.ts', 'tests/**/*.ts' ],
	extends: [
		eslint.configs.recommended,
		...tseslint.configs.strict,
		...tseslint.configs.stylistic
	],
	rules: {
		'no-console': 'off',
		'no-constant-condition': 'off',
		'curly': [
			'error',
			'all'
		],
		'dot-location': [
			'error',
			'property'
		],
		'dot-notation': 'error',
		'no-alert': 'error',
		'no-caller': 'error',
		'no-case-declarations': 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-implicit-coercion': [
			'error',
			{
				'boolean': false,
				'string': true,
				'number': true
			}
		],
		'no-implied-eval': 'error',
		'no-labels': 'error',
		'no-lone-blocks': 'error',
		'no-multi-spaces': 'error',
		'no-multi-str': 'error',
		'no-new': 'error',
		'no-new-func': 'error',
		'no-new-wrappers': 'error',
		'no-return-assign': 'error',
		'no-self-compare': 'error',
		'no-sequences': 'error',
		'no-useless-call': 'error',
		'no-useless-concat': 'error',
		'no-useless-escape': 'error',
		'no-useless-return': 'error',
		'no-void': 'error',
		'no-with': 'error',
		'wrap-iife': 'error',
		'yoda': [
			'error',
			'never'
		],

		// ## Stylistic issues
		'array-bracket-spacing': [
			'error',
			'always'
		],
		'block-spacing': [
			'error',
			'always'
		],
		'camelcase': [
			'error',
			{
				'properties': 'never'
			}
		],
		'comma-style': [
			'error',
			'last'
		],
		'computed-property-spacing': [
			'error',
			'always'
		],
		'consistent-this': [
			'error',
			'that'
		],
		'eol-last': [
			'error',
			'always'
		],
		'indent': [
			'error',
			'tab',
			{
				'SwitchCase': 1
			}
		],
		'key-spacing': 'error',
		'linebreak-style': [
			'error',
			'unix'
		],
		'lines-around-comment': [
			'error',
			{
				beforeBlockComment: true,
				allowObjectStart: true,
				allowBlockStart: true,
				allowArrayStart: true
			}
		],
		'max-len': [
			'error',
			140
		],
		'max-statements-per-line': [
			'error',
			{
				max: 1
			}
		],
		'new-parens': 'error',
		'no-multiple-empty-lines': [
			'error',
			{
				max: 1
			}
		],
		'no-nested-ternary': 'error',
		'no-new-object': 'error',
		'no-trailing-spaces': 'error',
		'no-whitespace-before-property': 'error',
		'one-var': [
			'error',
			{
				initialized: 'never'
			}
		],
		'operator-linebreak': [
			'error',
			'after'
		],
		'padded-blocks': [
			'error',
			'never'
		],
		'padding-line-between-statements': [
			'error',
			{ blankLine: 'always', prev: 'block-like', next: '*' },
			{ blankLine: 'always', prev: '*', next: 'block-like' },
			{ blankLine: 'always', prev: '*', next: 'return' },
			{ blankLine: 'always', prev: '*', next: [ 'const', 'let', 'var' ] },
			{ blankLine: 'always', prev: [ 'const', 'let', 'var' ], next: '*' },
			{ blankLine: 'any', prev: [ 'const', 'let', 'var' ], next: [ 'const', 'let', 'var' ] },
			{ blankLine: 'always', prev: 'directive', next: '*' },
			{ blankLine: 'any', prev: 'directive', next: 'directive' }
		],
		'class-methods-use-this': 'off',
		'no-prototype-builtins': 'off',
		'require-atomic-updates': 'off',
		'array-callback-return': 'error',
		'no-buffer-constructor': 'error',
		'no-lonely-if': 'error',
		'no-new-require': 'error',
		'no-path-concat': 'error',
		'no-unneeded-ternary': 'error',
		'prefer-arrow-callback': 'error',
		'prefer-object-spread': 'error',
		'require-await': 'error',
		'space-before-function-paren': [
			'error',
			{
				'anonymous': 'never',
				'named': 'never',
				'asyncArrow': 'always'
			}
		],
		'quote-props': [
			'error',
			'as-needed',
			{
				'unnecessary': false
			}
		],
		'semi-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],
		'space-in-parens': [
			'error',
			'always'
		],
		'space-unary-ops': [
			'error',
			{
				words: true,
				nonwords: false
			}
		],
		'spaced-comment': [
			'error',
			'always'
		],
		'template-tag-spacing': [
			'error',
			'never'
		],
		'unicode-bom': [
			'error',
			'never'
		],

		// ## ECMAScript 6
		'arrow-parens': [
			'error',
			'as-needed'
		],
		'arrow-spacing': 'error',
		'arrow-body-style': [ 'error', 'as-needed' ],
		'generator-star-spacing': [
			'error',
			'after'
		],
		'no-duplicate-imports': 'error',
		'no-useless-computed-key': 'error',
		'no-var': 'error',
		'object-shorthand': 'error',
		'prefer-const': [
			'error',
			{
				destructuring: 'all',
				ignoreReadBeforeAssign: true
			}
		],
		'prefer-rest-params': 'error',
		'prefer-spread': 'error',
		'symbol-description': 'error',
		'template-curly-spacing': [
			'error',
			'always'
		],
		'yield-star-spacing': [
			'error',
			'after'
		],
		'@typescript-eslint/ban-types': [
			'error',
			{
				types: { Function: false },
				extendDefaults: true
			}
		],
		'@typescript-eslint/consistent-type-assertions': [
			'error',
			{
				assertionStyle: 'as',
				objectLiteralTypeAssertions: 'allow-as-parameter'
			}
		],
		'@typescript-eslint/explicit-member-accessibility': [
			'error',
			{
				accessibility: 'explicit',
				overrides: {
					constructors: 'off'
				}
			}
		],
		'@typescript-eslint/member-delimiter-style': 'error',
		'@typescript-eslint/no-confusing-non-null-assertion': 'error',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/type-annotation-spacing': 'error',
		'@typescript-eslint/unified-signatures': 'error',
		'@typescript-eslint/no-unused-expressions': 'error',
		'@typescript-eslint/no-use-before-define': [
			'error',
			{
				functions: false,
				classes: false,
				variables: true,
				typedefs: false,
				ignoreTypeReferences: true
			}
		],
		'@typescript-eslint/comma-dangle': [ 'error', 'never' ],
		'@typescript-eslint/comma-spacing': [
			'error',
			{
				before: false,
				after: true
			}
		],
		'@typescript-eslint/func-call-spacing': [ 'error', 'never' ],
		'@typescript-eslint/keyword-spacing': 'error',
		'@typescript-eslint/no-array-constructor': 'error',
		'@typescript-eslint/object-curly-spacing': [ 'error', 'always' ],
		'@typescript-eslint/quotes': [ 'error', 'single' ],
		'@typescript-eslint/semi': 'error',
		'@typescript-eslint/space-before-blocks': [ 'error', 'always' ],
		'@typescript-eslint/space-before-function-paren': [
			'error',
			{
				anonymous: 'never',
				named: 'never',
				asyncArrow: 'always'
			}
		],
		'@typescript-eslint/space-infix-ops': 'error',
		'@typescript-eslint/no-useless-constructor': 'error',
		'object-property-newline': [
			'error',
			{ allowAllPropertiesOnSameLine: true }
		],
		'object-curly-newline': [
			'error',
			{ multiline: true, consistent: true }
		],
		'function-paren-newline': [ 'error', 'multiline-arguments' ],
		'function-call-argument-newline': [ 'error', 'consistent' ],
		'array-bracket-newline': [ 'error', 'consistent' ],
		'array-element-newline': [ 'error', 'consistent' ],
		'no-restricted-imports': [ 'error', { 'patterns': [ '**/dist/*' ] } ],
	}
});
