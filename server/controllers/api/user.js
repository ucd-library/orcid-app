const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users')
const {hasUcdAuth, handleError} = require('../middleware');

/**
 * Get a users record
 */
router.get('/', hasUcdAuth, async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  try {
    res.json(await users.getUser(user.cas));
  } catch(e) {
    handleError(e, req, res);
  }
});

router.get('/sync', hasUcdAuth, async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  try {
    res.json(await users.getAndSyncUser(user.cas));
  } catch(e) {
    handleError(e, req, res);
  }
});

router.post('/update/employment', hasUcdAuth, async (req, res) => {
  let user = authUtils.getUserFromRequest(req);
  let employments = req.body;

  try {
    res.json(await users.updateEmployments(user.cas, employments));
  } catch(e) {
    handleError(e, req, res);
  }
});

module.exports = router;