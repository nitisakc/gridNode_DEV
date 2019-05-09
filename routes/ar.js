var express = require('express');
var router = express.Router();

router.post('/set', function(req, res, next) {
	// console.log(req.body);
	let body = req.body;

	global.var.ar = body;
	// console.dir(body);
	global.var.ar.sort((a,b) => (a[0] > b[0]));

	res.send(200);
});

module.exports = router;
