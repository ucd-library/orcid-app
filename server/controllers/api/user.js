const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users');
const admin = require('../../lib/admin');
const csvStringify = require('csv-stringify');
const {hasUcdAuth, handleError, isAdmin} = require('../middleware');

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

router.get('/all-employments', isAdmin, async (req, res) => {
  try {
    let overview = await admin.getUserOverview();

    res.set('Content-type', 'text/csv');
    csvStringify(
      overview,
      {
        header : true,
        columns: [ 'casId', 'name', 'email', 'linked', 'orcidId', 'organization', 'department', 'role', 'visibility', 'startDate' ]
      },
      (err, txt ) => res.send(txt)
    );
  } catch(e) {
    handleError(e, req, res);
  }

});

module.exports = router;