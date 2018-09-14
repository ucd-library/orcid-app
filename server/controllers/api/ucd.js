const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users');
const config = require('../../config');

router.get('/link', async (req, res) => {
  let id = req.params.id;
  let user = authUtils.getUserFromRequest(req);

  if( !user.orcid || !user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  await users.linkAccounts(user.cas, user.orcid.orcid);
  res.json(await users.getUser(user.orcid.orcid));
});