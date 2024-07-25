/*
 Copyright (c), CKSource Holding sp. z o.o. All rights reserved.
 */

import UI, { IUI } from './UI';

export default class Example {
	public foo(): void {
		console.log( 'bar' );
	}
}

( async () => {
	const ui: IUI = await UI.create();

	ui.info( 'CKBox migrator v1.0.0' );
	ui.succeed( 'Checking configuration' );

	ui.spinner( 'Checking connection to source storage (CKFinder)' );
	await wait( 1 );
	ui.succeed( 'Checking connection to source storage (CKFinder)' );

	ui.spinner( 'Checking connection to CKBox' );
	await wait( 1 );
	ui.succeed( 'Checking connection to CKBox' );

	ui.spinner( 'Analyzing source storage' );
	await wait( 3 );
	ui.succeed( 'Analyzing source storage' );

	ui.info( `
This tool will migrate files from the source storage using following steps:
- create asset categories in CKBox (3 categories will be created: Files, Images, FooBar)
- copy folder structure to CKBox (189 folders will be created)
- copy files to CKBox (28890 files will be copied)
- save the map of old and new file URLs
  (the map will be saved in /some/path/ckbox_mapped_URLs_18.07.2024_09.16.txt)
` );

	await ui.prompt( 'Would you like to continue? [y/N] ' );

	ui.info( 'Creating categories in CKBox' );
	ui.addIndent();
	ui.succeed( 'Created Files category' );
	ui.succeed( 'Created Images category' );
	ui.succeed( 'Created FooBar category' );
	ui.clearIndent();

	ui.succeed( 'Created FooBar category' );

	ui.spinner( 'Copying assets: 0% (processing file 1 of 5)' );
	await wait( 2 );
	ui.spinner( 'Copying assets: 20% (processing file 2 of 5)' );
	await wait( 2 );
	ui.warn( 'Files:/foo/bar.jpg - Image dimenssions exceed the plan limit (skipping)' );
	ui.spinner( 'Copying assets: 40% (processing file 3 of 5)' );
	await wait( 2 );
	ui.spinner( 'Copying assets: 60% (processing file 4 of 5)' );
	await wait( 2 );
	ui.spinner( 'Copying assets: 80% (processing file 5 of 5)' );
	await wait( 2 );
	ui.succeed( 'Copying assets: 100%' );
	ui.succeed( 'Migration completed' );
} )();

async function wait( seconds: number ) {
	await new Promise( resolve => setTimeout( resolve, seconds * 1000 ) );
}
