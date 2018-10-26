const express = require('express');
const router = express.Router();
const backup = require('../../lib/backup/export');
const {isAdminOrAeCron, handleError} = require('../middleware');
const logger = require('../../lib/logger');

router.get('/backup', isAdminOrAeCron, async (req, res) => {
  try {
    await backup.run();
    res.send({success: true});
  } catch(e) {
    handleError(e, req, res);
    logger.fatal('Failed to create backup from cron api', e);
  }
});

module.exports = router;