var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('www/remote.html', { root: '.' });
});

router.get('/display', function(req, res, next) {
  res.sendFile('www/display.html', { root: '.' });
});
router.get('/safe', function(req, res, next) {
  res.sendFile('www/safety.html', { root: '.' });
});
router.get('/online', function(req, res, next) {
  res.send('online');
});

module.exports = router;
