# About

The CKBox Migration Tool is a command-line interface tool designed to transfer files from your old system to CKBox. Depending on what is supported in your source system, it can create categories, folders and assets. The tool has built-in support for migration from CKFinder, or you can create a custom adapter to migrate files from any application you require.

# Requirements

* NodeJS 18.x or later

# Installation

The installation process includes cloning this repository, installing the necessary dependencies and building the project:

```sh
git clone git@github.com:ckbox-io/migration-tool.git
cd migration-tool
npm install
npm run build
```

# Performing migration

In order to migrate your assets, you will need to configure a connection to your source storage and to the CKBox. You can do this by modifying the `config.json` file.

## Configuration of CKBox connection

To configure the CKBox connection, you will need to provide access credentials (environment ID and access key). You can find more about CKBox credentials in [documentation of authorization in CKBox](https://ckeditor.com/docs/ckbox/latest/guides/configuration/authentication.html#creating-access-credentials).
Furthermore, you should provide `serviceOrigin` URL. If you are the SaaS client, this should point to `https://api.ckbox.io`. For On-Premises, you need to set this value to a URL pointing to the REST API of your CKBox On-Premises application.


```json
	"ckbox": {
		"accessCredentials": {
			"environmentId": "<ENVIRONMENT_ID>",
			"accessKey": "<ACCESS_KEY>"
		},
		"workspaceId": "<WORKSPACE_ID>",
		"serviceOrigin": "<SERVICE_ORIGIN>"
	}
```

Optionally, you can also provide `workspaceId`. If you don't, files will be uploaded to a default workspace. Read more about workspaces in [workspaces documentation](https://ckeditor.com/docs/ckbox/latest/features/file-management/workspaces.html).

### List of configuration options for CKBox connection

| Option name                           | Description                                    |
| ------------------------------------- | ---------------------------------------------- |
| ckbox.assetsCredentials.environmentId | Target environment for the migration.          |
| ckbox.assetsCredentials.accessKey     | Access Key used to sign authorization token.   |
| ckbox.workspaceId                     | Target workspace for the migration (optional). |
| ckbox.serviceOrigin                   | Sets the origin to use for the CKBox REST API. |


## Configuration of a source storage

### CKFinder

To migrate assets from CKFinder, you must set a `type` for `ckfinder`" set the URL to the connector, and add the headers used for authentication.

```json
	"source": {
		"type": "ckfinder",
		"options": {
			"connectorPath": "http://localhost:8080/ckfinder/connector",
			"authentication": {
				"headers": {
					"Cookie": "PHPSESSID=e0baf7e705e40f7e7dea7fa3d04a5a79"
				}
			}
		}
	}
```

#### List of configuration options for CKFinder connection

| Option name                           | Description                                       |
| ------------------------------------- | ------------------------------------------------- |
| source.type                           | Must be set to `ckfinder`.                        |
| source.options.connectorPath          | Sets the origin to use for the CKFinder REST API. |
| source.options.authentication.headers | Sets headers needed for authentication.           |

## Checking the configuration

Prior to initiating the migration process, it is advisable to verify the configuration by running the migrator in dry run mode.

```
npm start -- --dry-run
```

## Running the migration

To start the migration you need to execute the command below:

```sh
npm start
```

## Replacing the old URLs with the new ones in your application

Once the migration process is complete, the migrator generates a file that maps the old URLs to the new URLs. The file name will have the format `ckbox_mapped_URLs_[migration time].txt`. You can use this file to replace the old URLs with the new ones in your application.

The file contains pairs of URLs, with each pair on a new line. The URL of the source file and the migrated file are separated by a tab character.

# Custom sources

To migrate files from any source using this tool, you need to implement your own `SourceStorageAdapter`. The adapters prepare migration plans with the lists of categories, folders and assets to migrate. They also expose a method allowing the migrator to download files from the storage.

To create a new adapter, a directory must first be created in the `adapters/` directory. The directory name should be the same as the one used as the `type` in the `config.json` file.

The next step is to create the `Adapter.ts` file. This is the entry point of the adapter so you cannot change the filename. To create this file, you may use the boilerplate below:

```ts
import { ISourceStorageAdapter, IMigrationPlan, ISourceCategory, ISourceFolder, ISourceAsset } from '@ckbox-migrator';

import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { IsDefined, IsString } from 'class-validator';

export default class ExampleAdapter implements ISourceStorageAdapter {
	public readonly name: string = 'The name of your system';

	private _config: ExampleConfig;

	public async loadConfig( plainConfig: Record<string, unknown> ): Promise<void> {
		this._config = plainToInstance( CKFinderConfig, plainConfig );

		await validateOrReject( this._config );
	}

	public async verifyConnection(): Promise<void> {
		// Verify if you can connect and authorize to your source storage.
	}

	public async prepareMigrationPlan(): Promise<IMigrationPlan> {
		// Scan your source storage and identify the categories, folders and assets to migrate.

		return [
			categories: [],
			assets: []
		]
	}

	public async getAsset( downloadUrl: string ): Promise<NodeJS.ReadableStream> {
		// Get an asset content from you source storage.
	}
}

class ExampleConfig {
	@IsString()
	@IsDefined()
	public readonly foo: string;
}
```

If you created a source storage in the `example` directory, your source configuration should look like this:

```json
	"source": {
		"type": "example",
		"options": {
			"foo": "bar"
		}
	},
```

For further details on how to implement the adapter, please refer to the definitions of adapter interfaces in the [source code](src/SourceStorageAdapter.ts).

# License

This code is free to use under the terms of the MIT license.  Please refer to the [LICENSE](LICENSE) for further details.
