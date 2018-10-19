const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const api = require('../../lib/orcid-api');
const users = require('../../lib/users')
const config = require('../../config');
const firestore = require('../../lib/firestore');
const {hasUcdAuth} = require('../middleware');

/**
 * Get a users record
 */
router.get('/', async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  if( !user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  let response = await api.get(user.orcid.orcid, config.orcid.accessToken);
  response = handleApiResponse(response, res, 'server');

  firestore.setUser({
    id: user.orcid.orcid,
    orcid : response
  });
});

router.get('/reject-token', hasUcdAuth, async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  try {
    await users.revokeToken(user.cas);
    res.redirect('/auth/logout');
  } catch(e) {
    res.status(400).json({
      error : true,
      message : e.message
    });
  }
});

// Testing
// router.put('/:id/employment/:putCode', async (req, res) => {
//   let id = req.params.id;
//   let putCode = req.params.putCode;
//   let user = authUtils.getUserFromRequest(req);
  
//   if( !user.orcid || !user.orcid.access_token ) {
//     return res.status(403).send();
//   }
//   let access_token = user.orcid.access_token;

//   let response = await api.updateEmployment(putCode, id, req.body, access_token);
//   handleApiResponse(response, res, 'user');
// });

// router.delete('/:id/employment/:putCode', async (req, res) => {
//   let id = req.params.id;
//   let putCode = req.params.putCode;
//   let user = authUtils.getUserFromRequest(req);
  
//   if( !user.orcid || !user.orcid.access_token ) {
//     return res.status(403).send();
//   }
//   let access_token = user.orcid.access_token;

//   let response = await api.deleteEmployment(putCode, id, access_token);
//   handleApiResponse(response, res, 'user');
// });

// router.post('/:id/employment', async (req, res) => {
//   let id = req.params.id;
//   let user = authUtils.getUserFromRequest(req);
  
//   if( !user.orcid || !user.orcid.access_token ) {
//     return res.status(403).send();
//   }
//   let access_token = user.orcid.access_token;

//   let response = await api.addEmployment(id, req.body, access_token);
//   handleApiResponse(response, res, 'user');
// });

function handleApiResponse(api, exp, tokenType) {
  if( api.statusCode !== 200 ) {
    exp.status(api.statusCode).send(api.body);
    return api.body;
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

  return api;
}

module.exports = router;