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
  handleApiResponse(response, res, tokenType);
});

router.put('/:id/employment/:putCode', async (req, res) => {
  let id = req.params.id;
  let putCode = req.params.putCode;
  let user = authUtils.getUserFromRequest(req);
  
  if( !user.orcid || !user.orcid.access_token ) {
    return res.status(403).send();
  }
  let access_token = user.orcid.access_token;

  let response = await api.updateEmployment(putCode, id, req.body, access_token);
  handleApiResponse(response, res, 'user');
});

router.delete('/:id/employment/:putCode', async (req, res) => {
  let id = req.params.id;
  let putCode = req.params.putCode;
  let user = authUtils.getUserFromRequest(req);
  
  if( !user.orcid || !user.orcid.access_token ) {
    return res.status(403).send();
  }
  let access_token = user.orcid.access_token;

  let response = await api.deleteEmployment(putCode, id, access_token);
  handleApiResponse(response, res, 'user');
});

router.post('/:id/employment', async (req, res) => {
  let id = req.params.id;
  let user = authUtils.getUserFromRequest(req);
  
  if( !user.orcid || !user.orcid.access_token ) {
    return res.status(403).send();
  }
  let access_token = user.orcid.access_token;

  let response = await api.addEmployment(id, req.body, access_token);
  handleApiResponse(response, res, 'user');
});

function handleApiResponse(api, exp, tokenType) {
  if( api.statusCode !== 200 ) {
    return exp.status(api.statusCode).send(api.body);
  }

  try {
    api = JSON.parse(api.body);
  } catch(e) {
    api = api.body;
  }

  exp.json({
    tokenType,
    result : api 
  });
}

module.exports = router;