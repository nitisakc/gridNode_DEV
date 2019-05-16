var express = require('express');
var router = express.Router();

router.post('/set', function(req, res, next) {
	// console.log(req.body);
	let body = req.body;
	if(body.length == 0){
		global.arcount++;
	}
	if(body.length > 0 || global.arcount > 10){
		global.var.ar = body;
		global.var.ar.sort((a,b) => (a[0] > b[0]));
	}

	res.send(200);
});

module.exports = router;
