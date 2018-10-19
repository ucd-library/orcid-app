const express = require('express');
const path = require('path');
const spaMiddleware = require('@ucd-lib/spa-router-middleware');
const config = require('../config');
const authUtils = require('../lib/auth');
const logger = require('../lib/logger');
const userModel = require('../lib/users');

/**
 * How we load Webcomponent polyfills and Webpacked Polymer 3 application bundle.
 * The loader script is from @ucd-load/cork-app-load and expects the global
 * CORK_LOADER_VERSIONS which will load all required polyfills and application
 * js bundles with cache breaking version flags.
 */
const bundle = `
  <script>
    var CORK_LOADER_VERSIONS = {
      loader : '${config.client.versions.loader}',
      bundle : '${config.client.versions.bundle}'
    }
  </script>
  <script src="/loader/loader.js?_=${config.client.versions.loader}"></script>
`;

module.exports = (app) => {
  // set assets dir depending on our server environment 
  let assetsDir = path.join(__dirname, '..', 'client', config.client.assets);

  /**
   * Setup SPA app routes and template rendering
   */
  spaMiddleware({
    app: app,
    htmlFile : path.join(assetsDir, 'index.html'),
    isRoot : true,
    appRoutes : config.server.appRoutes,
    getConfig : async (req, res) => {
      let user = {
        session : authUtils.getUserFromRequest(req),
        data : null
      }
      
      if( user.session.cas ) {
        user.data = await userModel.getUser(user.session.cas);

        // if( !user.data.linked && user.session.cas ) {
        //   user.unlinkedUcd = await userModel.getUcdInfo(user.session.cas);
        // } 
      }

      return {
        user,
        appRoutes : config.server.appRoutes,
        env : config.client.env,
        orcidUrl : config.orcid.url,
        baseApiUrl : config.orcid.api.baseUrl
      }
    },
    template : async (req, res) => ({bundle})
  });

  /**
   * Setup static asset dir
   */
  app.use(express.static(assetsDir, {
    immutable: true,
    maxAge: '1y'
  }));

  logger.info('Client ENV='+config.client.env, 'Serving '+assetsDir, 'Bundle Info:', config.client.versions);
}