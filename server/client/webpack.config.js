const BUILD_IE = true;

let configs = require('@ucd-lib/cork-app-build').watch({
  // root directory, all paths below will be relative to root
  root : __dirname,
  entry : 'public/elements/orcid-app.js',
  // folder where bundle.js will be written
  preview : 'public/js',
  ie : 'ie-bundle.js',
  clientModules : 'public/node_modules'
}, BUILD_IE);


module.exports = configs;