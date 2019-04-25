let app = require('./app');
const { board, relay, lamp, move, speed, lift, other } = require('./arduino');
const syss = require('./syss');

global.io.on('connection', function(socket) {
	global.io.to(socket.id).emit('conn', socket.id);

	socket.on('ar', 	 (msgs)=> { global.var.ar 		= msgs; });

	socket.on('pidval',  (msgs)=> { 
		global.var.pidval = msgs; 
	    global.io.emit('pidval', msgs);
	});

	socket.on('selDeg',  (msgs)=> { global.var.selDeg = msgs; });
	socket.on('selSpd',  (msgs)=> { global.var.selSpd = msgs; });
	socket.on('en',  (msgs)=> { move.en(msgs); });
	socket.on('beep',  (msgs)=> { if(msgs) other.beep(); });
	socket.on('pidon',  (msgs)=> { global.var.pidon = msgs; });
	socket.on('dir',  (msgs)=> { msgs == 0 ? move.stop() : move.dir(msgs == 1); });
	socket.on('liftup',  (msgs)=> { lift.process(msgs); });
});

setInterval(()=>{
    global.io.emit('var', global.var);
}, 200);

require('./screen');


// let varName = ['en','dirfw', 'currSpd', 'setSpd', 'currDeg', 'selDeg', 'diffDeg', 'pidon', 'pidval', 'liftpos', 'liftup', 'safety', 'pallet'];

//      for (let i = 0; i < varName.length; i++) {
//        console.log(global.var[varName[i]]);
//      }

// term.moveTo(10,10);
// term( 'Hello world!\n' );