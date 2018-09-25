const express = require('express');
const router = express.Router();
const api = require('../../lib/orcid-api');
const config = require('../../config');
const firestore = require('../../lib/firestore');
const usersModel = require('../../lib/users');
const logger = require('../../lib/logger');

router.get('/oauth-login', (req, res) => {
  logger.info('Starting orcid auto flow');

  let url = config.orcid.url+'/oauth/authorize';
  let params = {
    client_id : config.orcid.clientId,
    response_type : 'code',
    scope : config.orcid.api.scopes,
    redirect_uri : config.server.host+'/auth/orcid/oauth-callback',
    prompt : 'login'
  }

  let parr = [];
  for( let key in params ) {
    parr.push(key+'='+encodeURIComponent(params[key]));
  }

  res.redirect(`${url}?${parr.join('&')}`);
});

router.get('/oauth-callback', async (req, res) => {
  let code = req.query.code;
  if( !code ) return res.status(400).send('No code sent');

  let response = await api.generateToken({
    code,
    grant_type: 'authorization_code'
  });

  if( response.statusCode !== 200 ) {
    logger.error(`Failed to generate orcid auth token (${response.statusCode}): ${response.body}`);
    return res.status(response.statusCode).send(response.body);
  }

  try {
    response = JSON.parse(response.body);
    req.session[config.orcid.sessionName] = response;

    logger.info('Updating user info from orcid auto flow for: '+response.orcid);
    await usersModel.updateOrcidInfo(response.orcid, response.access_token);

    res.redirect('/');
  } catch(e) {
    res.status(400).send('Unable to parse Oauth body');
  }
  
});

module.exports = router;