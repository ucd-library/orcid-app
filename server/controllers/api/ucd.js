const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users');
const config = require('../../config');
const logger = require('../../lib/logger');

router.get('/link', async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  if( !user.orcid || !user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  logger.info('Linking accounts: ', user.cas, user.orcid.orcid);
  
  try {
    await users.linkAccounts(user.cas, user.orcid.orcid);
    res.json(await users.getUser(user.orcid.orcid));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }
});

module.exports = router;