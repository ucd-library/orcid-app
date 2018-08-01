const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const api = require('../../lib/orcid-api');
const config = require('../../config');

router.get('/:id', async (req, res) => {
  let id = req.params.id;
  let user = authUtils.getUserFromRequest(req);

  let accessToken = config.orcid.accessToken;
  let tokenType = 'server';
  if( user.orcid && user.orcid.access_token ) {
    tokenType = 'user';
    accessToken = user.orcid.access_token;
  }

  let response = await api.get(id, accessToken);
  if( response.statusCode !== 200 ) {
    return res.status(response.statusCode).send(response.body);
  }

  response = JSON.parse(response.body);

  res.json({
    tokenType,
    record : response
  });
});

module.exports = router;