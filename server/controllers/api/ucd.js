const express = require('express');
const router = express.Router();
const authUtils = require('../../lib/auth');
const users = require('../../lib/users');
const ucdApi = require('../../lib/ucd-iam-api');
const logger = require('../../lib/logger');
const {hasOrcidAuth, hasUcdAuth, isAdmin, handleError} = require('../middleware');

// Link user accounts
router.get('/link', hasUcdAuth, async (req, res) => {
  let user = req.user;
  logger.info('Linking account for: ', user.cas);
  
  try {
    await users.linkAccounts(user.cas);
    res.json(await users.getUser(user.cas));
  } catch(e) {
    handleError(e, req, res);
  }
});

// resync users UCD information to firestore
// router.get('/sync', hasUcdAuth, async (req, res) => {
//   let user = req.user;
//   try {
//     res.json(await users.syncUcd(user.cas));
//   } catch(e) {
//     handleError(e, req, res);
//   }
// });

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

  if( !user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }
  if( !(await authUtils.isAdmin(user.cas)) ) {
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

router.get('/get-iam-email/:email', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getIamFromEmail(req.params.email));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});


// admin call, get UCD college information
router.get('/get-college/:orgId', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getColleges(req.params.orgId));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

router.get('/get-odr-division/:orgId', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getOdrDivisions(req.params.orgId));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

router.get('/get-division/:orgId', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getDivisions(req.params.orgId));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

router.get('/get-odr-dept/:deptId', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getOdrOrgInfo(req.params.deptId));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

router.get('/get-dept/:deptId', isAdmin, async (req, res) => {
  try {
    res.json(await ucdApi.getOrgInfo(req.params.deptId));
  } catch(e) {
    res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

});

module.exports = router;