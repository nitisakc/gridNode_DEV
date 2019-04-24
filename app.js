const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const pjson = require('./package.json');

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser();
parser.addArgument([ '-p', '--port' ], { defaultValue: pjson.port, required: false, type: 'string' });
var args = parser.parseArgs();

const index = require('./routes/index');

let app = express();

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'www')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', index);

const port = args.port;
app.set('port', port);
var server = http.createServer(app);
server.listen(port);

global.syss = pjson.syss;
global.var = pjson.var;
const syss = require('./syss');

global.io = require('socket.io').listen(server);
global.io.on('connection', function(socket) {
	global.io.to(socket.id).emit('conn', socket.id);

	socket.on('ar', 	 (msgs)=> { global.var.ar 		= msgs; });

	socket.on('pidval',  (msgs)=> { 
		global.var.pidval = msgs; 
	    global.io.emit('pidval', msgs);
	});

	socket.on('selDeg',  (msgs)=> { 
		global.var.selDeg = msgs; 
	    // global.io.emit('pidval', msgs);
	});
});

module.exports = app;