var express = require('express');
var router = express.Router();

router.post('/set', function(req, res, next) {
	// console.log(req.body);
	global.var.to = 2029;

	res.send(200);
});

module.exports = router;
