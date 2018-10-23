const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const api = require('../../lib/orcid-api');
const users = require('../../lib/users')
const config = require('../../config');
const firestore = require('../../lib/firestore');
const {hasUcdAuth, handleError} = require('../middleware');

/**
 * Get a users record
 */
router.get('/', hasUcdAuth, async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  try {
    res.json(await this.getUser(user.cas));
  } catch(e) {
    handleError(e, req, res);
  }
});

module.exports = router;