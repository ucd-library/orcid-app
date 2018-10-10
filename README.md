# orcid-app
UC Davis Library - ORCiD Web Application

# Requirements

- [NodeJS & NPM](https://nodejs.org/en/)
- [Git](https://git-scm.com/)
- Yarn
  - ```npm install -g yarn```
- [gcloud](https://cloud.google.com/sdk/install)

# Setup

Clone repo

```bash
git clone https://github.com/ucd-library/orcid-app
```

Install NPM & Yarn dependencies

```bash
cd orcid-app/server
npm install
cd client/public
yarn install
```

# Develop

Start client auto bundle watch process

```bash
cd server && npm run watch
```

Start server.  From root dir

```
node server
```

# Deploy

Build the dist package for the client. All commands from server dir

```bash
npm run dist
```

You will need to ```gcloud``` for deployment and have access to the Google Cloud projects.  First login with gcloud.

```bash
gcloud auth login
```

Then to deploy to the dev env

```bash
npm run deploy-dev
```

To deploy to production

```bash
npm run deploy-prod
```
