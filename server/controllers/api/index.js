var router = require('express').Router();

router.use('/orcid', require('./orcid'));
router.use('/ucd', require('./ucd'));

module.exports = router;