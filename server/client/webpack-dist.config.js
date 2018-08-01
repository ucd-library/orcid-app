const path = require('path');

let configs = require('@ucd-lib/cork-app-build').dist({
  // root directory, all paths below will be relative to root
  root : __dirname,
  entry : 'public/elements/orcid-app.js',
  // folder where bundle.js and ie-bundle.js will be written
  dist : 'dist/js',
  ie : 'ie-bundle.js',
  clientModules : 'public/node_modules'
});

module.exports = configs;