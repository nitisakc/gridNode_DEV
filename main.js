let app = require('./app');
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const func = require('./utils/func');
const { board, relay, lamp, move, lift, other } = require('./arduino');
const syss = require('./syss');
const wifi = require("node-wifi");
const request = require('request');
let conf = require('./config/main.json');
let steps = require('./config/steps.json');

let calcErr = d3.scaleLinear().domain([0, 180]).range([180, 0]).clamp(true);

let fixSpeed = conf.fixSpeed;
let palletpoint = conf.palletpoint;
let nonSafety = conf.nonSafety;
let runInter, offsetInter, turnInter, bufInter, wifiInter, blockInter, clrblockInter;

let degNow = 180, sef = global.var.safety.on, backoffset = conf.backoffset;
let l = 1, step = 0;
let lflag = true;

wifi.init({
  iface: null
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

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
		global.var.to = 0;
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
		global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 54, 50, 51];
		run(true, ()=>{
			//lift.process(2, ()=>{
				global.var.to = null;
				global.var.buffer = null;
				if(global.var.ready == true){
					seeJob();
				}
			//});
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
	socket.on('safety',  (msgs)=> { 
		sef = !sef;
		global.var.safety.on = sef;
	});
	socket.on('seejob',  (msgs)=> { global.var.ready = true; seeJob(); });
});

setInterval(()=>{
    global.io.emit('var', global.var);
}, 400);

// require('./screen');

let connect = (ssid, callblack = null)=>{
	wifiInter = setInterval(()=>{
		wifi.getCurrentConnections(function(err, currCon) {
		  	if (err) { console.log(err); return; }
		  	if(currCon && currCon[0].ssid != ssid){
		  		global.log('Connecting ' + ssid +'...');
			  	wifi.connect({ ssid: ssid }, function(err) {
				  	if (err) {
				    	console.log(err);
				  	}else{
						clearInterval(wifiInter);
						global.log('Connected ' + ssid);
						if(callblack){ callblack(); }
					}
				});
		  	}else{
				clearInterval(wifiInter);
				global.log('Connected ' + ssid);
				if(callblack){ callblack(); }
		 	 }
		   
		});

	}, 5000);
}

let toBuffer = (callback)=>{
	// global.var.route = [8, 13, 7, 10, 14];
	bufInter = setInterval(()=>{
		if(global.var.buffer != null){ 
			clearInterval(bufInter);
			let b = global.var.buffer ;
			if(b == 7){ global.var.route = [8, 13, 7]; }
			else if(b == 10){ global.var.route = [8, 13, 7, 10]; }
			else if(b == 14){ global.var.route = [8, 13, 7, 10, 14]; }
			if(b == 58){ global.var.route = [97, 69, 58]; }
			else if(b == 57){ global.var.route = [97, 69, 58, 57]; }
			else if(b == 56){ global.var.route = [97, 69, 58, 57, 56]; }

			if(global.var.liftpos != 1){
				lift.process(1, ()=>{});
			}

			global.log('toBuffer ' + global.var.buffer);
			if(b == 7 || b == 10 || b == 14){ 
				run(false, ()=>{
					lift.process(2, ()=>{
						global.var.route = [13, 8, 38];
						run(true, ()=>{
							turn(0, ()=>{
								global.var.buffer = null;
								callback(); 
							}, true, true);
						});
					});
				}, conf.bufferosl);
			}

			if(b == 56 || b == 57 || b == 58){ 
				global.var.route = [97, 69];
				run(false, ()=>{
					turn(180, ()=>{
						if(b == 58){ global.var.route = [58]; }
						else if(b == 57){ global.var.route = [58, 57]; }
						else if(b == 56){ global.var.route = [58, 57, 56]; }
						run(false, ()=>{
							// turn(180, ()=>{
								lift.process(2, ()=>{
									global.var.route = [69, 97, 26];
									run(true, ()=>{
										turn(270, ()=>{
											global.var.buffer = null;
											callback(); 
										}, true);
									});
								});
							// }, true);
						}, conf.bufferosl);
					}, false)
				});
			}

		}else{
			global.log('Buffer NULL');
		}
	}, 1000);
}

let loop = (s)=>{
	if(s){
		global.log('Loop ' + step);
		if(step < s.length){
			let inx = step;

			if(s[inx].event == 'run'){
				global.var.route = JSON.parse(JSON.stringify(s[inx].route));
				if(s[inx].osl){
					run(s[inx].dir, ()=>{ step++; loop(s); }, s[inx].osl);
				}else{
					run(s[inx].dir, ()=>{ step++; loop(s); });	
				}
			}else if(s[inx].event == 'turn'){
				turn(s[inx].deg, ()=>{ step++; loop(s); }, s[inx].dir);
			}else if(s[inx].event == 'lift'){
				//loop(s);
				lift.process(s[inx].dir, ()=>{ step++; loop(s); });
			}else if(s[inx].event == 'clearorder'){
				//
				// clearOrder(global.var.to, ()=>{ step++; loop(s); });
				clearOrder(global.var.to, ()=>{
					// global.var.to = null;
					step++;
					loop(s);
				});
			}else if(s[inx].event == 'connect'){
				connect(s[inx].ssid, ()=>{
					step++;
					loop(s);
				});
			}else if(s[inx].event == 'block'){
				block(s[inx].zone, ()=>{
					step++;
					loop(s);
				});
			}
			
		}
		else{
			toBuffer(()=>{
				// if(global.var.to != null && global.var.ready){
				// 	// steps = require(stepfile);
				// 	step = 0;
				// 	loop(steps[global.var.to]);
				// 	// console.dir(steps[global.var.to]);
				// }else{
					toStandby();
				// }
			});
		}
	}
}

let seeJob = ()=>{
	// falseRun();
	global.log('Standby');
	request({
	    method: 'GET',
	    url: `http://192.168.101.7:3310/api/waitjob/${global.var.number}`,
	    timeout: 1000
	}, (err, res, body)=>{
		if(err){
			global.log('Send waitjob error.');
		}
	});

	setTimeout(()=>{
		if(global.var.to == 0){

		}
		else if(global.var.to != null && global.var.ready){
			step = 0;
			loop(steps[global.var.to]);
			// console.dir(steps[global.var.to]);
		}else{
			seeJob();
		}

		// global.var.route = [68, 94, 93, 92, 87, 91, 90, 86, 89 ,85, 84, 116, 117, 112];
		// global.var.route = [89 ,85, 84, 109, 116, 117, 112];
		// global.var.route = [43, 36, 45 ,5, 100, 107, 111];
		// run(true, ()=>{
		// 	global.var.route = [117, 115];
		// 	run(false, ()=>{
		// 		turn(0, ()=>{ 
		// 			global.var.route = [119, 113, 114, 104, 103];
		// 			run(false, ()=>{
		// 				global.log('end'); 
		// 			}, -230);
		// 		}, true, true);
		// 	}, -160);
		// });
	}, 3000);
}

var pm2 = require('pm2');

pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }
	// pm2.start({
 //    	script    : 'py/ar.py',         // Script to be run
 //    	interpreter: 'python3',
 //    	args: ['--back', backoffset]
	// }, function(err, apps) {
 //  		pm2.start({
	// 	    script    : 'py/safety.py',         // Script to be run
	// 	    interpreter: 'python3'
	// 	  	}, function(err, apps) {
			    pm2.disconnect();   // Disconnects from PM2
			    if (err) throw err
		// });
  // });
});

let clrblock = (z, callback)=>{
	clrblockInter = setInterval(()=>{
		global.log('Get Block ' + z);
		request({
		    method: 'GET',
		    url: `http://192.168.101.7:3310/api/clrblock/${global.var.number}/${z}`,
		    timeout: 1500
		}, (err, res, body)=>{
	    	if(res && res.statusCode == 200){
	    		clearInterval(clrblockInter);
				global.log('Block ' + z);
				if(callblack){ callblack(); }
	    	}
		});
	}, 2500);
}

let block = (z, callback)=>{
	blockInter = setInterval(()=>{
		global.log('Get Block ' + z);
		request({
		    method: 'GET',
		    url: `http://192.168.101.7:3310/api/block/${global.var.number}/${z}`,
		    timeout: 1500
		}, (err, res, body)=>{
	    	if(res && res.statusCode == 200){
	    		clearInterval(blockInter);
				global.log('Block ' + z);
				if(callblack){ callblack(); }
	    	}
		});
	}, 2500);
}

let clearOrder = (t, callback)=>{
	// callback();
    lamp.b.on();
	request.get(
	    `http://192.168.101.7:3310/api/clrorder/${t}`,
	    (err, res, body)=>{
    		lamp.b.off();
	    	callback();
	    }
	);
}

let run = (dir = true, callback, osl = conf.oslRun)=>{
	global.log('Routing ' + JSON.stringify(global.var.route));
	let ar0count = 0, lencount = 0, runInterFreq = 20;
	runInter = setInterval(()=>{
		if(global.var.route.length == 0){
			clearInterval(runInter);
			move.stop();
			global.log('Route 0');
			if(callback){ callback(); }
		}else if(global.var.route.length > 0){
			let block = null;
			if(typeof global.var.route[0] === 'object'){
				block = global.var.route[0];
			}
			let num =  block ? block.num : global.var.route[0];
			block = block && (global.zone[block.zone] == null || global.zone[block.zone] == global.var.number) ? null : block; //***Check Zone***//

			if(nonSafety.indexOf(num) > -1){
				global.var.safety.on = false;
			}else{
				global.var.safety.on = sef;
			}

			let a = global.var.ar.find(d => d[0] == num);
			if(a){
				global.log('Go to number ' + num);
				if(dir){
					if(a[6] == 'F' && a[4] > osl){
						global.var.selDeg = a[5];
						global.var.pidval = a[5];
						if(global.var.route.length > 1 && a[4] < conf.nextoffset && block == null){
	    					global.io.emit('currpos', num);
							global.var.route.shift();
						}
					}else{
						if(block != null){
							block.stop = true;
						}else{
		    				global.io.emit('currpos', num);
							global.var.route.shift();
						}
					}
				}else{
					let bs = (osl != conf.oslRun ? osl : (backoffset * -1));
					if(a[4] > bs){
	    				global.io.emit('currpos', num);
						global.var.route.shift();
					}else if(palletpoint.indexOf(num) > -1 && (global.var.rds[1] < -1 || global.var.rds[0] < -1)){
						lencount++;
						if(lencount > 3){
							global.log('rds = ' + global.var.rds[0] + ',' + global.var.rds[1]);
							global.var.route = [];
						}else{
							global.var.selDeg = parseInt(90 + (a[3] / 1));
							global.var.pidval = parseInt(90 + (a[3] / 1));
						}
					}else{
						lencount = 0;
						global.var.selDeg = parseInt(90 + (a[3] / 1));
						global.var.pidval = parseInt(90 + (a[3] / 1));
					} 
				}
				
				if(global.var.route.length == 0 || (block && block.stop)){ move.stop(); }
				else{
					if(global.var.route.length == 1 || block){
						if(fixSpeed.indexOf(num) > -1){ move.run(dir, (dir ? conf.fixSpeed[0] : conf.fixSpeed[1]), true); }
						else{
							move.run(dir, (Math.abs(a[4]) < conf.last.len) ? conf.last.spd[0] : conf.last.spd[1], true);
						}
					}else{
						if(fixSpeed.indexOf(num) > -1){ move.run(dir, (dir ? conf.fixSpeed[0] : conf.fixSpeed[1]), true); }
						else{ move.run(dir, (dir ? conf.runspd[0] : conf.runspd[1]), true); }
					}
				}
				ar0count = 0;
			}else{
				if(ar0count > conf.ar0count){
					move.stop();
					global.log('AR 0');
				}else{
					move.run(dir, (dir ? conf.ar0spd[0] : conf.ar0spd[1]), false);
					ar0count = ar0count + 1;
				}
			}
		}
	}, runInterFreq);
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

let turn = (d, callblack, rd = null, lowspd = false)=>{
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

			if(Math.abs(diff) > (lowspd ? 5 : 1)){
				if(dir >= 0 && turnFlag){ 
    				global.var.selDeg = tr;
				}
				else if(dir < 0 && turnFlag){ 
    				global.var.selDeg = tl;
				}

				if(rd != null){
					global.var.selDeg = rd ? tr : tl;
				}
				
				if((global.var.selDeg == tr && (rd == true ? global.var.currDeg < 349 : (global.var.currDeg > (tr - (lowspd ? 10 : 5))))) || (global.var.selDeg == tl && global.var.currDeg < (tl + (lowspd ? 10 : 5)))){
					turnFlag = false;
					if(Math.abs(diff) > (lowspd ? conf.turnDeg[0] : conf.turnDeg[1])){
						move.run(true, (lowspd ? conf.turnspd[0] : conf.turnspd[1]));
					}else{
						move.run(true, (lowspd ? conf.turnspdrdu[0] : conf.turnspdrdu[1]));
					}
				}
			}else{					
				// global.log('AR 0');
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

let trueRun = ()=>{
	global.var.route = [13, 8, 38]; 
	run(true, ()=>{
		func.wait(2000, ()=>{
			falseRun();
		});
	});
}
let falseRun = ()=>{
	global.var.route = [8, 13, 7, 10, 14]; 
	run(false, ()=>{
		func.wait(2000, ()=>{
			trueRun();
		});
	});
}

// setTimeout(()=>{
// 	falseRun();
// }, 3000);


// setTimeout(()=>{
// 	global.var.buffer = 56;
// 	if(global.var.buffer != null){ 
// 		let b = global.var.buffer ;
// 		if(b == 7){ global.var.route = [8, 13, 7]; }
// 		else if(b == 10){ global.var.route = [8, 13, 7, 10]; }
// 		else if(b == 14){ global.var.route = [8, 13, 7, 10, 14]; }
// 		if(b == 58){ global.var.route = [97, 69, 58]; }
// 		else if(b == 57){ global.var.route = [97, 69, 58, 57]; }
// 		else if(b == 56){ global.var.route = [97, 69, 58, 57, 56]; }


// 		global.log('toBuffer ' + global.var.buffer);
// 		if(b == 7 || b == 10 || b == 14){ 
// 			run(false, ()=>{
// 				lift.process(2, ()=>{
// 					global.var.route = [13, 8, 38];
// 					run(true, ()=>{
// 						turn(0, ()=>{
// 							global.var.buffer = null;
// 							// callback(); 
// 						}, true);
// 					});
// 				});
// 			});
// 		}

// 		if(b == 56 || b == 57 || b == 58){ 
// 			global.var.route = [97, 69];
// 			run(false, ()=>{
// 				turn(180, ()=>{
// 					if(b == 58){ global.var.route = [58]; }
// 					else if(b == 57){ global.var.route = [58, 57]; }
// 					else if(b == 56){ global.var.route = [58, 57, 56]; }
// 					run(false, ()=>{
// 						lift.process(2, ()=>{
// 							global.var.route = [69, 97, 26];
// 							run(true, ()=>{
// 								turn(270, ()=>{
// 									global.var.buffer = null;
// 									// callback(); 
// 								}, true);
// 							});
// 						});
// 					});
// 				}, false)
// 			});
// 		}

// 	}
// }, 3000);


//global.var.to

