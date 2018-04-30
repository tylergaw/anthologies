# [Anthologies](https://anthologies.co)

Package links to share stories.

## Requirements

- node 6.10 **NOTE: You have to run in 6.10 because Lambda@Edge does not support node 8.x yet.**
- [Sam Local](https://github.com/awslabs/aws-sam-local) `npm install -g aws-sam-local`
- [Docker](https://store.docker.com/editions/community/docker-ce-desktop-mac) Required by Sam Local
- **Deploying**: You need a local AWS identity config in place with permission to access S3 and Lambda

## Setup

Clone the project

```
git clone <repo-url>
cd anthologies
```

Install yarn/npm dependencies

```
yarn
or
npm i
```

### Running the local server

Make sure you're on npm 6.x. `nvm use` will see the `.nvmrc` and switch to it.

```
sam local start-api
```

Available at [http://localhost:3000](http://localhost:3000)

### Running the front end file watcher

```
yarn watch
or
npm run watch
```

This doesn’t use BrowserSync or similar. I have LiveReload installed locally, connected with the Chrome extension.
