var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendfile('www/to.html');
});

router.get('/set/:id/:buf', function(req, res, next) {
	// console.log(req.body);
	global.var.to = req.params.id;
	global.var.buffer = req.params.buf;

	res.send(200);
});

module.exports = router;
