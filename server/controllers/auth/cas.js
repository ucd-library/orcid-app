const CASAuthentication = require('cas-authentication');
const express = require('express');
const config = require('../../config');
const router = express.Router();

const cas = new CASAuthentication({
  cas_url     : config.cas.url,
  service_url : config.server.host+'/auth/cas',
  session_name : config.cas.sessionName
});

router.get('/login', (req, res) => {
  // logger.info('CAS Service: starting CAS redirection');

  req.query.returnTo = config.server.host+'/auth/cas/login';

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