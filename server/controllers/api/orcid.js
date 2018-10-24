const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users')
const {hasUcdAuth} = require('../middleware');


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

router.get('/profile/:id', async (req, res) => {
  let response;
  try {
    response = await users.getPublicProfileByUcdId(req.params.id);
    res.set('x-id-type', response.type);
    res.status(response.statusCode).json(response.body);
  } catch(e) {
    res.status(400).json({
      error : true,
      message : e.message
    });
  }
});

router.get('/profile/:id/id', async (req, res) => {
  let response;
  try {
    response = await users.getPublicProfileByUcdId(req.params.id, true);
    res.set('x-id-type', response.type);
    res.json({orcid: response.id});
  } catch(e) {
    res.status(400).json({
      error : true,
      message : e.message
    });
  }
});

module.exports = router;