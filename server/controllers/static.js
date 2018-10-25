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
    getConfig : async (req, res, next) => {
      let user = {
        session : {},
        data : null
      }
      
      let session = authUtils.getUserFromRequest(req);
      try {
        if( session.cas ) {
          if( req.query.noreload ) {
            user.data = await userModel.getUser(session.cas);
          } else {
            user.data = await userModel.getAndSyncUser(session.cas, false, false);
          }
        }
        user.session = session;
      } catch(e) {
        if( e.statusCode === 401 && e.bodyType === 'json' && e.body.error === 'invalid_token' ) {
          await userModel.clearUserLinkage(session.cas);
          return res.redirect('/auth/logout');
        }
      }

      next({
        user,
        appRoutes : config.server.appRoutes,
        env : config.env,
        clientEnv : config.client.env,
        orcidUrl : config.orcid.url,
        baseApiUrl : config.orcid.api.baseUrl,
        orgs : config.ringgold.orgs,
        appPartners : config.ringgold.appPartners,
        clientId : config.orcid.clientId
      });
    },
    template : async (req, res, next) => next({bundle})
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