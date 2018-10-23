var router = require('express').Router();

router.use('/orcid', require('./orcid'));
router.use('/ucd', require('./ucd'));
router.use('/user', require('./user'));

module.exports = router;