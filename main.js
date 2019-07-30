let app = require('./app');
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const func = require('./utils/func');
const { board, relay, lamp, move, lift, other } = require('./arduino');
const syss = require('./syss');
let steps = require('./steps.json');
const request = require('request');

let calcErr = d3.scaleLinear().domain([0, 180]).range([180, 0]).clamp(true);

let fixSpeed = [16, 38];
let nonSafety = [];
let runInter, offsetInter, turnInter;

let degNow = 180, sef = global.var.safety.on;
let l = 1, step = 0;
let lflag = true;
let stepfile= './steps.json', stepfsbfile = './stepsfsb.json';

let clearjob = ()=>{
	global.log('Clear Job');
	clearInterval(runInter);
	clearInterval(offsetInter);
	clearInterval(turnInter);
	global.var.route = [];
	global.var.to = null;
	global.var.buffer = null;
	move.stop();
}

let goHome = ()=>{
	if(global.var.ar.length > 0){
		global.log('Go Home'); 
		global.var.ready = false;
		turn(180, ()=>{
			global.var.route = [6 ,40, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38];
			run(true, ()=>{
				turn(0, ()=>{
					global.var.route = [8];
					run(true, ()=>{
						global.var.to = null;
						global.var.buffer = null;
						// seeJob();
					});
				}, true);
			});
		}, true);

	// clearjob();
		// global.var.to = 0;
		// global.var.buffer = 0;
		// let currDeg = global.var.ar[0][2];
		// if(currDeg > 135 && currDeg < 225){
		// 	let r = [67, 66, 65, 64, 63, 62, 47, 41, 6 ,40, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38];
		// 	for(i = 0; i < r.length; i++){
		// 		let a = global.var.ar.find(d => d[0] == r[i] && d[6] == 'F' && d[4] > 50);
		// 		if(a){
		// 			i = 9999;
		// 			r.splice(0,i+1);
		// 			global.var.route = r;
		// 			run(true, ()=>{
		// 				turn(0, ()=>{
		// 					global.var.route = [8];
		// 					run(true, ()=>{
		// 						global.var.to = null;
		// 						global.var.buffer = null;
		// 						seeJob();
		// 					});
		// 				}, true);
		// 			});
		// 		}
		// 	}
		// }
	}
}

let toStandby = ()=>{
	if(global.var.ar.length > 0){
		global.log('To Standby');
		global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 27, 50, 51];
		run(true, ()=>{
			lift.process(2, ()=>{
				global.var.ready = true;
				seeJob();
			});
		});


	// let currDeg = global.var.ar[0][2];
		// if(currDeg > 315 && currDeg < 45){
		// 	let r = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 27, 50, 51];
		// 	for(i = 0; i < r.length; i++){
		// 		let a = global.var.ar.find(d => d[0] == r[i] && d[6] == 'F' && d[4] > 50);
		// 		if(a){
		// 			i = 9999;
		// 			r.splice(0,i+1);
		// 			global.var.route = r;
		// 			global.log(r);
		// 			run(true, ()=>{
		// 				lift.process(2, ()=>{
		// 					stepfile = stepfile2;
		// 					seeJob();
		// 				});
		// 			});
		// 		}
		// 	}
			
		// }
	}
}

global.io.on('connection', function(socket) {
	global.io.to(socket.id).emit('conn', socket.id);
	global.io.emit('logs', global.logs);

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
	socket.on('goHome',  (msgs)=> { goHome(); });
	socket.on('toStandby',  (msgs)=> { toStandby(); });
	socket.on('clearjob',  (msgs)=> { clearjob(); });
});

setInterval(()=>{
    global.io.emit('var', global.var);
}, 400);

// require('./screen');

let toBuffer = (callback)=>{
	global.var.route = [8, 13, 7, 10, 14];
	if(global.var.buffer == null){ global.var.route = [8, 13, 7]; }
	else if(global.var.buffer == 7){ global.var.route = [8, 13, 7]; }
	else if(global.var.buffer == 10){ global.var.route = [8, 13, 7]; }
	else if(global.var.buffer == 14){ global.var.route = [8, 13, 7, 10, 14]; }
	
	global.log('toBuffer ' + global.var.buffer);
	run(false, ()=>{
		lift.process(2, ()=>{
			global.var.route = [7, 13, 8, 38];
			run(true, ()=>{
				turn(0, ()=>{
					global.var.route = [8];
					run(true, ()=>{
						// global.var.to = null;
						global.var.buffer = null;
						callback(); 
					});
				}, true);
			});
		});
	});
}

let loop = (s)=>{
	if(s){
		global.log('Loop ' + step);
		if(step < s.length){
			let inx = step;

			if(s[inx].event == 'run'){
				global.var.route = JSON.parse(JSON.stringify(s[inx].route));
				run(s[inx].dir, ()=>{ step++; loop(s); });
			}else if(s[inx].event == 'turn'){
				turn(s[inx].deg, ()=>{ step++; loop(s); }, s[inx].dir);
			}else if(s[inx].event == 'lift'){
				//loop(s);
				lift.process(s[inx].dir, ()=>{ step++; loop(s); });
			}else if(s[inx].event == 'clearorder'){
				//loop(s);
				// clearOrder(global.var.to, ()=>{ step++; loop(s); });
				clearOrder(global.var.to);
				global.var.to = null;
			}
			
		}
		else{
			toBuffer(()=>{
				if(global.var.to != null && global.var.ready){
					steps = require(stepfile);
					step = 0;
					loop(steps[global.var.to]);
					// console.dir(steps[global.var.to]);
				}else{
					toStandby();
				}
				// request.get(
				//     `http://192.168.101.7:3310/api/getorder`,
				//     (err, res, body)=>{
				//     	if(!err && res.statusCode == 200 && body && body != '' && global.var.to == null){ global.var.to = body; }
				//     	if(global.var.to != null){
				// 			steps = require(stepfile1);
				// 			step = 0;
				// 			loop(steps[global.var.to]);
				// 			// console.dir(steps[global.var.to]);
				// 		}else{
				// 			toStandby();
				// 		}
				//     }
				// );
			});
		}
	}
}

let seeJob = ()=>{
	global.log('Standby');
	setTimeout(()=>{
		// if(global.var.to != null){
		// 	steps = require('./steps.json');
		// 	step = 0;
		// 	global.log('To ' + global.var.to);
		// 	loop(steps[global.var.to]);
		// 	// console.dir(steps[global.var.to]);
		// }else{
		// 	seeJob();
		// }

		// if(global.var.to == 0){ return; }
		if(global.var.to != null && global.var.ready){
			steps = require(stepfsbfile);
			step = 0;
			loop(steps[global.var.to]);
			// console.dir(steps[global.var.to]);
		}else{
			seeJob();
		}
		// request.get(
		//     `http://192.168.101.7:3310/api/getorder`,
		//     (err, res, body)=>{
		//     	if(!err && res.statusCode == 200 && body && body != '' && global.var.to == null){ global.var.to = body; }
		//     	if(global.var.to != null){
		// 			steps = require(stepfile);
		// 			step = 0;
		// 			loop(steps[global.var.to]);
		// 			// console.dir(steps[global.var.to]);
		// 		}else{
		// 			seeJob();
		// 		}
		//     }
		// );
	}, 3000);
}

// setTimeout(()=>{
// 	// doJob();

// 	seeJob();
	
// },3000);

var pm2 = require('pm2');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }
  
  pm2.start({
    script    : 'py/ar.py',         // Script to be run
    interpreter: 'python3'
  }, function(err, apps) {
    pm2.disconnect();   // Disconnects from PM2
    if (err) throw err
  });
});

let clearOrder = (t, callback)=>{
	// callback();
	request.get(
	    `http://192.168.101.7:3310/api/clrorder/${t}`,
	    (err, res, body)=>{
	    	// console.dir(body);
	    	// if(!err && res.statusCode == 200){
	    	// 	callback();
	    	// }else{
	    	// 	clearOrder(t, callback);
	    	// }

	    	// if(callback){ callback(); }
	    	// if(err && res.statusCode != 200){
	    	// 	clearOrder(t);
	    	// }
	    }
	);
}

let run = (dir = true, callback)=>{
	global.log('Routing ' + JSON.stringify(global.var.route));
	let ar0count = 0;
	runInter = setInterval(()=>{
		if(global.var.route.length == 0){
			clearInterval(runInter);
			move.stop();
			global.log('Route 0');
			if(callback){ callback(); }
		}else if(global.var.route.length > 0){
			if(nonSafety.indexOf(global.var.route[0]) > -1){
				global.var.safety.on = false;
			}else{
				global.var.safety.on = sef;
			}

			global.log('Go to number ' + global.var.route[0]);
			let a = global.var.ar.find(d => d[0] == global.var.route[0]);
			if(a){
				if(dir){
					if(a[6] == 'F' && a[4] > 15){
						global.var.selDeg = a[5];
						global.var.pidval = a[5];
						if(global.var.route.length > 1 && a[4] < 80){
							global.var.route.shift();
						}
					}else{
						global.var.route.shift()
					}
				}else{
					if(a[4] < -220){
						global.var.selDeg = parseInt(90 + (a[3] / 3));
						global.var.pidval = parseInt(90 + (a[3] / 3));
					}else{
						global.var.route.shift()
					} 
				}
				
				if(global.var.route.length == 0){ move.stop(); }
				else{
					if(global.var.route.length == 1){
						if(fixSpeed.indexOf(global.var.route[0]) > -1){ move.run(dir, (dir ? 60 : 50), true); }
						else{
							move.run(dir, (Math.abs(a[4]) < 150) ? 30 : 50, true);
						}
					}else{
						if(fixSpeed.indexOf(global.var.route[0]) > -1){ move.run(dir, (dir ? 60 : 50), true); }
						else{ move.run(dir, (dir ? 100 : 60), true); }
					}
				}
				ar0count = 0;
			}else{
				if(ar0count > 250){
					move.stop();
					global.log('AR 0');
				}else{
					move.run(dir, (dir ? 60 : 40), false);
					ar0count = ar0count + 1;
				}
			}
		}
	}, 20);
}

let offset = (no, callblack)=> {
	global.var.selDeg = 90;
	global.log('Run Offset ' + no);
	offsetInter = setInterval(()=>{
		let a = global.var.ar.find(d => d[0] == no);
		if(a){
			global.var.selDeg = 90 + (a[2] - degNow);
		}else if(global.var.ar.length > 0){
			global.var.selDeg = 90 + (global.var.ar[0][2] - degNow);
		}

		if(a && (global.var.currDeg > 85 || global.var.currDeg < 95)){
			let l = a[4];
			if(l > -200){
				move.run(true, 50, false);
			}else if(l < -140){
				move.run(false, 50, false);
			}else{
				move.stop();
				clearInterval(offsetInter);
				global.log('Offset ' + no + ' done.');
				if(callblack){ callblack(); }
			}
		}
	}, 20);
}

let turn = (d, callblack, rd = null)=>{
	global.log('Turning ' + d);
	let turnFlag = true;
	turnInter = setInterval(()=>{
		if(global.var.ar.length > 0){
			let z = (rd == true && d == 0 ? 359 : d);
			// z = (z == 180 ? 170 : z);
			let currDeg = global.var.ar[0][2];
			currDeg = currDeg < 0 ? 360 + currDeg : currDeg;
			let diff = currDeg - z; 

			let dir = z - calc.absDeg(currDeg);
			let tr = 180, tl = 0;

			if(Math.abs(diff) > 1){
				if(dir >= 0 && turnFlag){ 
    				global.var.selDeg = tr;
				}
				else if(dir < 0 && turnFlag){ 
    				global.var.selDeg = tl;
				}

				if(rd != null){
					global.var.selDeg = rd ? tr : tl;
				}
				
				if((global.var.selDeg == tr && (rd == true ? global.var.currDeg < 349 : (global.var.currDeg > (tr - 5)))) || (global.var.selDeg == tl && global.var.currDeg < (tl + 5))){
					turnFlag = false;
					if(Math.abs(diff) > 40){
						move.run(true, 75);
					}else{
						move.run(true, 27);
					}
				}
			}else{					global.log('AR 0');
    			global.var.selDeg = 90;
    			move.stop();
				if(global.var.currDeg < 92 || global.var.currDeg > 88){
					clearInterval(turnInter);
					func.wait(200, ()=>{
						global.log('Turn ' + d );
						callblack();
					});
				}
			}
		}
	}, 10);
}


//global.var.to

