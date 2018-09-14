var router = require('express').Router();

router.use('/cas', require('./cas'));
router.use('/orcid', require('./orcid'));

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;