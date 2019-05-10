let app = require('./app');
const calc = require('./utils/calc');
const func = require('./utils/func');
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
	global.var.route = [64, 63, 62, 47, 41, 6 ,40, 42];
	run(true, ()=>{
		turn(0, ()=>{
			global.var.route = [6, 41, 47, 62, 63, 64];
			run(true, ()=>{
				offset(46, ()=>{
					turn(90, ()=>{
						global.var.route = [43];
						run(false, ()=>{
							lift.process(2, ()=>{
								offset(64, ()=>{
									turn(180, ()=>{
										global.var.route = [63, 62, 47, 41, 6 ,40, 42];
										run(true, ()=>{
											turn(0, ()=>{
												global.var.route = [6, 41, 47, 62, 63, 64];
												run(true, ()=>{
													offset(46, ()=>{
														turn(90, ()=>{
															global.var.route = [43];
															run(false, ()=>{
																lift.process(1, ()=>{
																	
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
},8000);

let run = (dir = true, callback)=>{
	let runInter = setInterval(()=>{
		if(global.var.route.length == 0){
			clearInterval(runInter);
			move.stop();
			if(callback){ callback(); }
			// turn(0, ()=>{
			// 	global.var.route = [6,41,47,62,63,64,65];
			// 	run();
			// });
		}else if(global.var.route.length > 0){
			let a = global.var.ar.find(d => d[0] == global.var.route[0]);
			if(a){
				if(a[6] == (dir ? 'F' : 'R')){
					global.var.selDeg = a[5];
					global.var.pidval = a[5];
				}else{
					global.var.route.shift()
				} 
				if(global.var.route.length == 0){ move.stop(); }
				else{
					if(global.var.route.length == 1 && a[4] < 200){
						move.run(dir, 30, true);
					}else{
						move.run(dir, (dir ? 100 : 50), true);
					}
				}
			}else{
				move.run(dir, (dir ? 60 : 30), false);
			}
		}
	}, 10);
}

let offset = (no, callblack)=> {
	global.var.selDeg = 90;
	let runInter = setInterval(()=>{
		let a = global.var.ar.find(d => d[0] == no);

		if(a && (global.var.currDeg > 85 || global.var.currDeg < 95)){
			let l = a[4];
			if(l > -130){
				move.run(true, 40, false);
			}else if(l < -140){
				move.run(false, 40, false);
			}else{
				move.stop();
				clearInterval(runInter);
				if(callblack){ callblack }
			}
		}
	}, 20);
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
	}, 10);
}

