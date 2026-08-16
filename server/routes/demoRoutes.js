const express = require('express');

const router = express.Router();

const scamMessages = require('../data/scamMessages');

router.get('/demo-scams', (req, res) => {
  res.json(scamMessages);
});

module.exports = router;