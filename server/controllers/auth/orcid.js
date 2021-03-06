/**
 * ORCiD Oauth Login.  Both login and oauth callback endpoints set here.
 */
const express = require('express');
const router = express.Router();
const api = require('../../lib/orcid-api');
const config = require('../../config');
const usersModel = require('../../lib/users');
const logger = require('../../lib/logger');

router.get('/oauth-login', (req, res) => {
  logger.info('Starting orcid auto flow');

  let url = config.orcid.url+'/oauth/authorize';


  let params = {
    client_id : config.orcid.clientId,
    response_type : 'code',
    scope : config.orcid.api.scopes,
    grant_type : 'authorization_code',
    redirect_uri : config.server.host+'/auth/orcid/oauth-callback'
    // Would be nice if ORCiD supported this...
    // prompt : 'login'
  }

  let parr = [];
  for( let key in params ) {
    parr.push(key+'='+encodeURIComponent(params[key]));
  }

  res.redirect(`${url}?${parr.join('&')}`);
});

router.get('/oauth-callback', async (req, res) => {
  let code = req.query.code;
  let error = req.query.error;

  if( error ) {
    if( error === 'access_denied' ) res.redirect('/denied-orcid-oauth');
    else res.status(400).send(error+': '+(req.query.error_description || ''))
    return;
  }

  if( !code ) return res.status(400).send('No code sent');

  // TODO: don't generate new token unless scopes changes
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
    await usersModel.setOrcidInfo(response.orcid, req.session[config.ucd.cas.sessionName], response);

    res.redirect('/');
  } catch(e) {
    logger.error('Unable to parse ORCiD Oauth body', e);
    res.status(400).send('Unable to parse ORCiD Oauth body');
  }
  
});

module.exports = router;