const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  res.send('<p>test test</p>');
});

router.get('/', function (req, res) {
  res.json({ message: "api test" });
});

module.exports = router;
