var router = require('express').Router();

router.use('/cas', require('./cas'));

module.exports = router;