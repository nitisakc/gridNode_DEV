var express = require('express');
var router = express.Router();

router.get('/set/:id', function(req, res, next) {
	// console.log(req.body);
	global.var.to = req.params.id;

	res.send(200);
});

module.exports = router;
