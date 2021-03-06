var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendfile('www/to.html');
});

router.get('/ready/:flag', function(req, res, next) {
	global.var.ready = req.params.flag == 0 ? false : true;
	res.send(global.var.ready);
});


router.get('/steps', function(req, res, next) {
  res.send(require('../steps.json'));
});

router.get('/set/:id/:buf', function(req, res, next) {
	// console.log(req.body);
	global.var.to = req.params.id;
	global.var.buffer = req.params.buf;

	res.send(200);
});

router.get('/setbuf/:buf', function(req, res, next) {
	// console.log(req.body);
	global.var.buffer = req.params.buf == 0 ? null : req.params.buf;

	res.send(200);
});


router.get('/set/:id', function(req, res, next) {
	// console.log(req.body);
	if(global.var.to == null && global.var.ready){
		global.var.to = req.params.id;
		res.send(200);
	}else{
		res.send(404);
	}
});

module.exports = router;
