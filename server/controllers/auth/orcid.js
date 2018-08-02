const express = require('express');
const router = express.Router();
const api = require('../../lib/orcid-api');
const config = require('../../config');

router.get('/oauth-login', (req, res) => {
  let url = 'https://sandbox.orcid.org/oauth/authorize';
  let params = {
    client_id : config.orcid.clientId,
    response_type : 'code',
    scope : '/authenticate /activities/update',
    redirect_uri : config.server.host+'/auth/orcid/oauth-callback'
    // redirect_uri : 'http://localhost'
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
    return res.status(response.statusCode).send(response.body);
  }

  try {
    response = JSON.parse(response.body);
    req.session[config.orcid.sessionName] = response; 
    res.redirect('/main');
  } catch(e) {
    res.status(400).send('Unable to parse Oauth body');
  }
  
});

module.exports = router;