var express = require('express');
var router = express.Router();

router.post('/set', function(req, res, next) {
	// console.log(req.body);
	let body = req.body;
	// if(body.length == 0){
	// 	global.arcount++;
	// }
	global.arcount = 11
	if(body.length > 0 || global.arcount > 10){
		global.var.ar = body;
		global.var.ar.sort((a,b) => (a[1] > b[1]));
	}

	res.sendStatus(200);
});

module.exports = router;
