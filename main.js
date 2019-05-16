let app = require('./app');
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const func = require('./utils/func');
const { board, relay, lamp, move, lift, other } = require('./arduino');
const syss = require('./syss');

let calcErr = d3.scaleLinear().domain([0, 180]).range([180, 0]).clamp(true);

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

let degNow = 90;


let doJob2 = ()=>{
	global.log('Start Job');
	let l = 1;
	l = (l == 1 ? 2 : 1);
	offset(46, ()=>{
		turn(90, ()=>{
			global.var.route = [46];
			run(false, ()=>{
				lift.process(l, ()=>{
					offset(64, ()=>{
						turn(0, ()=>{
							doJob2();
						});
					});
				});
			});
		});
	});
}

let doJob = ()=>{
	global.log('Start Job');
	global.var.route = [63, 62, 47, 41, 6 ,40, 42];
	run(true, ()=>{
		turn(0, ()=>{
			global.var.route = [6, 41, 47, 62, 63, 64];
			run(true, ()=>{
				offset(46, ()=>{
					turn(90, ()=>{
						global.var.route = [46];
						run(false, ()=>{
							lift.process(2, ()=>{
								global.log('Lift Down');
								offset(64, ()=>{
									turn(180, ()=>{
										global.var.route = [63, 62, 47, 41, 6 ,40, 42];
										run(true, ()=>{
											turn(0, ()=>{
												global.var.route = [6, 41, 47, 62, 63, 64];
												run(true, ()=>{
													offset(46, ()=>{
														turn(90, ()=>{
															global.var.route = [46];
															run(false, ()=>{
																lift.process(1, ()=>{
																	global.log('Lift Up');
																	offset(64, ()=>{
																		turn(180, ()=>{
																			doJob();
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
		});
	});
}

// err = currDeg - degNow
// err = 90 + (currDeg - degNow);

setTimeout(()=>{
	// doJob();
	// global.var.route = [46];
		// run(false, ()=>{});
},8000);

let run = (dir = true, callback)=>{
	global.log('Routing ' + JSON.stringify(global.var.route));
	let runInter = setInterval(()=>{
		if(global.var.route.length == 0){
			clearInterval(runInter);
			move.stop();
			global.log('Route 0');
			if(callback){ callback(); }
		}else if(global.var.route.length > 0){
			global.log('Go to number ' + global.var.route[0]);
			let a = global.var.ar.find(d => d[0] == global.var.route[0]);
			if(a){
				if(dir){
					if(a[6] == 'F' && a[4] > 20){
						global.var.selDeg = a[5];
						global.var.pidval = a[5];
					}else{
						global.var.route.shift()
					}
				}else{
					if(a[4] < 20){
						global.var.selDeg = 90 + (a[2] - degNow);//calcErr(a[5]);
						global.var.pidval = 90 + (a[2] - degNow);//calcErr(a[5]);
					}else{
						global.var.route.shift()
					} 
				}
				
				if(global.var.route.length == 0){ move.stop(); }
				else{
					if(global.var.route.length == 1 && a[4] < 200){
						move.run(dir, 30, true);
					}else{
						move.run(dir, (dir ? 100 : 80), true);
					}
				}
			}else{
				move.run(dir, (dir ? 60 : 40), false);
			}
		}
	}, 10);
}

let offset = (no, callblack)=> {
	global.var.selDeg = 90;
	global.log('Run Offset ' + no);
	let runInter = setInterval(()=>{
		let a = global.var.ar.find(d => d[0] == no);

		if(a && (global.var.currDeg > 85 || global.var.currDeg < 95)){
			let l = a[4];
			if(l > -130){
				move.run(true, 50, false);
			}else if(l < -140){
				move.run(false, 50, false);
			}else{
				move.stop();
				clearInterval(runInter);
				global.log('Offset ' + no + ' done.');
				if(callblack){ callblack(); }
			}
		}
	}, 20);
}

let turn = (d, callblack)=>{
	global.log('Turning ' + d);
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
					if(Math.abs(diff) > 40){
						move.run(true, 80);
					}else{
						move.run(true, 25);
					}
				}
			}else{
    			global.var.selDeg = 90;
    			move.stop();
				if(global.var.currDeg < 92 || global.var.currDeg > 88){
					clearInterval(turnInter);
					// func.wait(1000, ()=>{
						global.log('Turn ' + d );
						callblack();
					// });
				}
			}
		}
	}, 10);
}

