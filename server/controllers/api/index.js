var router = require('express').Router();

router.use('/orcid', require('./orcid'));

module.exports = router;