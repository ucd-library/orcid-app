const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users');
const ucdApi = require('../../lib/ucd-iam-api');
const logger = require('../../lib/logger');
const {hasOrcidAuth, hasUcdAuth, isAdmin} = require('../middleware');

// Link user accounts
router.get('/link', hasOrcidAuth, hasUcdAuth, async (req, res) => {
  let user = req.user;
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

// Run auto updates for verified UCD information
router.get('/auto-update', hasOrcidAuth, async (req, res) => {
  let user = req.user;
  let cas = user.cas;
  if( !cas ) {
    let user = await users.getUser(user.orcid.orcid);
    if( !user.ucd ) {
      return res.status(400).json({error: true, message: 'You must first link account with UCD'});
    } else if( !user.ucd.casId ) {
      return res.status(400).json({error: true, message: 'You must first link account with UCD'});
    }
    cas = user.ucd.casId;
  }

  try {
    let {updates, record} = await users.addUcdInfo(user.orcid.orcid, cas, user.orcid.access_token);

    if( updates.length === 0 ) { // no updates
      return res.json({updates});
    } else {
      return res.send({
        updates,
        record,
        id : user.orcid
      })
    }
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }
});

// resync users UCD information to firestore
router.get('/sync', hasOrcidAuth, hasUcdAuth, async (req, res) => {
  let user = req.user;
  try {
    res.json(await users.syncUcd(user.orcid.orcid, user.cas));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }
});

// admin call, get user UCD info via CAS ID
router.get('/get-user-cas/:casId', isAdmin, async (req, res) => {
  try {
    res.json(await users.getUcdInfo(req.params.casId));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

// admin call, get UCD information via IAM id
router.get('/get-user-iam/:iamId', isAdmin, async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  if( !user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }
  if( !(await authUtils.isAdmin(user.orcid.orcid)) ) {
    return res.status(401).json({error: true, message: 'nope.'});
  }

  try {
    res.json(await users.getUcdInfo(req.params.iamId, true));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

// admin call, get UCD college information
router.get('/get-colleges', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getColleges());
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

module.exports = router;