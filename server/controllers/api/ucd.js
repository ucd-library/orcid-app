const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users');
const config = require('../../config');
const logger = require('../../lib/logger');
const firestore = require('../../lib/firestore');

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

router.get('/auto-update', async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  if( !user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  try {
    let {updates, record} = await users.addUcdInfo(user.orcid.orcid, user.cas, user.orcid.access_token);

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

router.get('/sync', async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  if( !user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

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

router.get('/get-user-cas/:casId', async (req, res) => {
  let user = authUtils.getUserFromRequest(req);

  if( !user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }
  if( !(await authUtils.isAdmin(user.orcid.orcid)) ) {
    return res.status(401).json({error: true, message: 'nope.'});
  }

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

router.get('/get-user-iam/:iamId', async (req, res) => {
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

module.exports = router;