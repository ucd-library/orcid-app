const authUtils = require('../lib/auth');

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

  if( !req.user.orcid ) {
    return res.status(401).json({error: true, message: 'not logged in with ORCiD'});
  }

  if( !(await authUtils.isAdmin(req.user.orcid.orcid)) ) {
    return res.status(401).json({error: true, message: 'nope.'});
  }

  next();
}

module.exports = {setUser, hasOrcidAuth, hasUcdAuth, isAdmin}