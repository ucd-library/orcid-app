const authUtils = require('../lib/auth');

function setUser(req, res, next) {
  req.user = authUtils.getUserFromRequest(req);
  next();
}

function hasOrcidAuth(req, res, next) {
  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  next();
}

function hasUcdAuth(req, res, next) {
  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !user.cas ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  next();
}

async function isAdmin(req, res, next) {
  if( !req.user ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in'});
  }

  if( !(await authUtils.isAdmin(user.orcid.orcid)) ) {
    return res.status(401).json({error: true, message: 'nope.'});
  }

  next();
}

module.exports = {setUser, hasOrcidAuth, hasUcdAuth, isAdmin}