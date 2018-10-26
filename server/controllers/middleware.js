const authUtils = require('../lib/auth');
const orcidApi = require('../lib/orcid-api');
const users = require('../lib/users');

function setUser(req, res, next) {
  req.user = authUtils.getUserFromRequest(req);
  next();
}

function hasOrcidAuth(req, res, next) {
  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !req.user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in with ORCiD'});
  }

  next();
}

function hasUcdAuth(req, res, next) {
  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !req.user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in with UCD'});
  }

  next();
}

async function isAdmin(req, res, next) {
  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !req.user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in with CAS'});
  }

  if( !(await authUtils.isAdmin(req.user.cas)) ) {
    return res.status(401).json({error: true, message: 'nope.'});
  }

  next();
}

async function isAdminOrAeCron(req, res, next) {
  if( req.get('x-appengine-cron') === 'true' ) {
    return next();
  }

  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !req.user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in with CAS'});
  }

  if( !(await authUtils.isAdmin(req.user.cas)) ) {
    return res.status(401).json({error: true, message: 'nope.'});
  }

  next();
}

async function handleError(e, req, res) {
  // normal error, just bubble to API for now
  if( !(e instanceof orcidApi.ApiAccessError) ) {
    return res.status(400).json({
      error: true,
      message : e.message,
      stack : e.stack
    });
  }

  // clear user linkage
  if( e.statusCode === 401 && e.bodyType === 'json' && e.body.error === 'invalid_token' ) {
    let cas = authUtils.getUserFromRequest(req).cas;
    await users.clearUserLinkage(cas);
  }

  // send error along
  res.status(e.statusCode).json({
    error : true,
    message : e.message,
    body : e.body
  });

  return true;
}

module.exports = {setUser, isAdminOrAeCron, hasOrcidAuth, hasUcdAuth, isAdmin, handleError}