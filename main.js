let app = require('./app');
const calc = require('./utils/calc');
const { board, relay, lamp, move, lift, other } = require('./arduino');
const syss = require('./syss');

global.io.on('connection', function(socket) {
	global.io.to(socket.id).emit('conn', socket.id);

	socket.on('ar', 	 (msgs)=> { global.var.ar 		= msgs; });

	socket.on('pidval',  (msgs)=> { 
		global.var.pidval = msgs; 
	    global.io.emit('pidval', msgs);
	});

	socket.on('img',  (msgs)=> { console.log(msgs); });

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

setTimeout(()=>{
	// run();
	// turn(0, ()=>{});
},5000);

let run = ()=>{
	let runInter = setInterval(()=>{
		if(global.var.route.length == 0){
			clearInterval(runInter);
			move.stop();
			turn(0, ()=>{
				global.var.route = [6,41,47,62,63,64,65];
				run();
			});
		}else if(global.var.route.length > 0){
			let a = global.var.ar.find(d => d[0] == global.var.route[0]);
			if(a){
				if(a[6] == 'F'){
					global.var.selDeg = a[5];
					global.var.pidval = a[5];
				}else{
					global.var.route.shift()
				} 
				if(global.var.route.length == 0){ move.stop(); }
				else{
					if(global.var.route.length == 1 && a[4] < 200){
						move.run(true, 30, true);
					}else{
						move.run(true, 100, true);
					}
				}
			}else{
				move.run(true, 50, false);
			}
		}
	}, 10);
}

let turn = (d, callblack)=>{
	let turnFlag = true;
	let turnInter = setInterval(()=>{
		if(global.var.ar.length > 0){
			let z = d;
			let currDeg = global.var.ar[0][2];
			currDeg = currDeg < 0 ? 360 + currDeg : currDeg;
			let diff = currDeg - z; 

			let dir = z - calc.absDeg(currDeg);

			if(Math.abs(diff) > 1){
				if(dir >= 0 && turnFlag){ 
    				global.var.selDeg = 180;
				}
				else if(dir < 0 && turnFlag){ 
    				global.var.selDeg = 1;
				}
				
				if((global.var.selDeg == 180 && global.var.currDeg > 175) || (global.var.selDeg == 1 && global.var.currDeg < 5)){
					turnFlag = false;
					if(Math.abs(diff) > 30){
						move.run(true, 70);
					}else{
						move.run(true, 30);
					}
				}
			}else{
    			global.var.selDeg = 90;
    			move.stop();
				if(global.var.currDeg < 95 || global.var.currDeg > 85){
					clearInterval(turnInter);
					// global.func.wait(1000, ()=>{
						callblack();
					// });
				}
			}
		}
	}, 20);
}

