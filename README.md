## asset-packs

This repo holds all the asset packs for the Web Editor. When the repo is deployed, all the files are hashed and uploaded to an S3 bucket under `contents/:hash` and the `catalog.json` is regenerated with all the asset packs and assets data. The bucket is accessible through the `builder-items.decentraland.*` via Cloudflare.

### Production

- Catalog: `https://builder-items.decentraland.org/catalog.json`

- Contents: `https://builder-items.decentraland.org/contents/:hash`

### Development

- Catalog: `https://builder-items.decentraland.zone/catalog.json`

- Contents: `https://builder-items.decentraland.zone/contents/:hash`

### Deployment

Every push to the `main` branch will be deployed to the development environemnt.

Every [release](https://github.com/decentraland/asset-packs/releases) will be deployed to the production environment.

### Local Development

You can develop this repo locally and test it within the Web Editor by doing the following:

Go to this repo in your machine and do this:

#### Using the command line

- To start the SDK7 scene and watch for changes:
  1. Run `npm run start:lib` to watch for changes.
  2. Run `npm run start:js` to start running the SDK7 scene locally (by default on port `8000`).
  3. Run `npm link` to allow other projects to symlink to this one.
  4. Copy the path to the `bin/index.js` in this repo (something like `/Users/my-user/path/to/asset-packs/bin/index.js`).

- To start the catalog server:
  1. Set the `AWS_ACCESS_KEY_ID` env var in `.env` to be your AWS access key.
  2. Set the `AWS_SECRET_ACCESS_KEY` env var in `.env` to be your AWS secret key.
  3. Set the `S3_BUCKET_NAME` env var in `.env` to be your S3 bucket.
  4. Set the `AWS_STORAGE_URL` env var in `.env` to be your custom S3 object server.
  5. Set the `CATALOG_SERVER_PORT` env var in `.env` to be `8002` (this is the catalog server we will start in the next step).
  6. Run `npm run start:catalog` to start running an http server to serve the catalog.json and the asset-packs content from a custom S3 object server (by default on port `8002`).

#### Using Docker

If you have docker running on your device, you can start all these services using the `docker-compose.yml` file in this repo by running: `docker-compose up`.

This will start the SDK7 scene and the catalog server with a minio S3 server to store the assets locally.

Go the `js-sdk-toolchain` repo in your machine and do this:

1. Run `cd packages/@dcl/inspector`.
2. Run `npm link @dcl/asset-packs` to symlink to your local repository
3. Run `npm start` to start a local dev server. It should start by default on port `8000` but since we are already using it for the SDK7 scene, it will start on port `8001`.

Go to the `builder` repo in your machine and do this:

1. Set the `REACT_APP_INSPECTOR_PORT` env var in `.env` to be `8001` (this is the `@dcl/inspector` dev server we started in the previous section).
2. Set the `REACT_APP_BIN_INDEX_JS_DEV_PORT` to the port where the SDK7 started running (by defualt `8000`).
3. Set the `REACT_APP_BIN_INDEX_JS_DEV_PATH` env var in `.env` to the path to the `bin/index.js` that you copied in the first section or if you're using docker, set the path to be `/app/bin/index.js`.
4. Set the `REACT_APP_CATALOG_URL` env var in `.env` to be `http://localhost:8002` (this is the catalog server we started in the first section).
5. Run `npm start` to start the builder local server which should start on port `3000`

Now you are all set, you can start developing the SDK7 scene in this repo, use it from the local Builder and test it by previewing the scene, which should use your local Builder Server serving the development javascript files.
