const CASAuthentication = require('cas-authentication');
const express = require('express');
const config = require('../../config');
const router = express.Router();
const firestore = require('../../lib/firestore');
const authUtils = require('../../lib/auth');

const cas = new CASAuthentication({
  cas_url     : config.ucd.cas.url,
  service_url : config.server.host+'/auth/cas',
  session_name : config.ucd.cas.sessionName
});

router.get('/login', (req, res) => {
  // logger.info('CAS Service: starting CAS redirection');


  // we want to force a login every time a user makes this call, but this url
  // endpoint is access via cas redirect and cas npm module final stupid redirect
  // to check for 'initial' login state, we are hacking the cas libraries redirect
  // params.

  // this is a redirect from CAS because it has a ticket, hack in the session cas_return_to
  // variable adding a flag that the login is complete, this will be used below
  if( req.query.ticket ) {
    req.session.cas_return_to = config.server.host+'/auth/cas/login?complete=true';
  
  // we are either starting a login flow or finishing, either way, set the normal redirect
  // returnTo parameter that the cas library checks
  } else {
    req.query.returnTo = config.server.host+'/auth/cas/login';
  }


  // if there is no ticket or complete parameter in the url, this is a fresh login, clear
  // the session variable to force the cas library to preform the auth flow.
  if( !req.query.ticket && !req.query.complete ) {
    console.log('New cas login flow, clearing cas session token');
    req.session[cas.session_name] = null;
  }

  cas.bounce(req, res, async () => {
    // logger.info('CAS Service: CAS redirection complete');
    
    let username = '';
    if( cas.session_name && req.session[cas.session_name] ) {
      username = req.session[cas.session_name];
    }

    if( username ) {
      // logger.info('CAS Service: CAS login success: '+username);
      res.redirect('/');
    } else {
      // logger.info('CAS Service: CAS login failure');
      res.status(401).send();
    }
  });
});

module.exports = router;