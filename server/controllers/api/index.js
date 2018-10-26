var router = require('express').Router();

router.use('/orcid', require('./orcid'));
router.use('/ucd', require('./ucd'));
router.use('/user', require('./user'));
router.use('/cron', require('./cron'));

module.exports = router;