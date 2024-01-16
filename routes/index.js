const express = require('express');
const router = express.Router();
const path = require('path');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});
module.exports = router;
