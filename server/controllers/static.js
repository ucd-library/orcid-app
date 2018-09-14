const express = require('express');
const path = require('path');
const fs = require('fs');
const spaMiddleware = require('@ucd-lib/spa-router-middleware');
const config = require('../config');
const authUtils = require('../lib/auth');
const logger = require('../lib/logger');
const userModel = require('../lib/users');

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
  let assetsDir = path.join(__dirname, '..', 'client', config.client.assets);

  /**
   * Setup SPA app routes
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
      
      if( user.session.orcid ) {
        user.data = await userModel.getUser(user.session.orcid.orcid)
      }

      return {
        user,
        appRoutes : config.server.appRoutes,
        env : config.client.env,
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