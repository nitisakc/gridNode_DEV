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

let degNow = 180,
	sef = global.var.safety.on;

let l = 1;

let lflag = true;

let toBuffer = (callback)=>{
	global.var.route = [8, 13, 7, 10, 14];
	if(global.var.to == 7){ global.var.route = [8, 13, 7]; }
	if(global.var.to == 10){ global.var.route = [8, 13, 7, 10]; }
	
	run(false, ()=>{
		// lift.process(2, ()=>{
			global.var.route = [7, 13, 8, 38];
			run(true, ()=>{
				turn(0, ()=>{
					global.var.route = [8];
					run(true, ()=>{
						global.var.to = null;
						callback(); 
					});
				}, true);
			});
		// });
	});
}

let doJob = ()=>{
	degNow = 0;
	global.log('Start Job');
	global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 6, 41, 47, 62, 63, 64, 65, 66, 67, 34];
	run(true, ()=>{
		turn(90, ()=>{
			global.var.route = [16]; 
			run(false, ()=>{
				turn(90, ()=>{
					lift.process(1, ()=>{
						global.var.route = [1]; 
						run(true, ()=>{
							turn(180, ()=>{
								global.var.route = [67, 66, 65, 64, 63, 62, 47, 41, 6 ,40, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38]; 
								run(true, ()=>{
									toBuffer(()=>{
										seeJob();
									});
								});
							}, true);
						});
					});
				}, false);
			});
		}, true);
	});
}

let doJob2031 = ()=>{
	degNow = 0;
	global.log('Start Job');
	global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36,45 ,5, 49, 4, 2];
	run(true, ()=>{
		turn(90, ()=>{
			global.var.route = [48]; 
			run(false, ()=>{
				// turn(90, ()=>{
					// lift.process(1, ()=>{
						global.var.route = [39]; 
						run(true, ()=>{
							turn(180, ()=>{
								global.var.route = [4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38]; 
								run(true, ()=>{
									toBuffer(()=>{
										seeJob();
									});
								});
							}, true);
						});
					// });
				// }, false);
			});
		}, true);
	});
}

let doJob2025 = ()=>{
	degNow = 0;
	global.log('Start Job');
	global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 27];
	run(true, ()=>{
		turn(90, ()=>{
			global.var.route = [96]; 
			run(false, ()=>{
				// turn(90, ()=>{
					// lift.process(1, ()=>{
						// global.var.route = [73]; 
						// run(true, ()=>{
							// turn(180, ()=>{
								global.var.route = [40, 31, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38]; 
								run(true, ()=>{
									toBuffer(()=>{
										seeJob();
									});
								});
							// }, true);
						// });
					// });
				// }, false);
			});
		}, true);
	});
}

let doJob2027 = ()=>{
	degNow = 0;
	global.log('Start Job');
	global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 73, 3, 88];
	run(true, ()=>{
		turn(270, ()=>{
			global.var.route = [72]; 
			run(false, ()=>{
				// turn(90, ()=>{
					// lift.process(1, ()=>{
						// global.var.route = [73]; 
						// run(true, ()=>{
							// turn(180, ()=>{
								global.var.route = [6, 40, 31, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38]; 
								run(true, ()=>{
									toBuffer(()=>{
										seeJob();
									});
								});
							// }, true);
						// });
					// });
				// }, false);
			});
		}, false);
	});
}

let doJob2024 = ()=>{
	degNow = 0;
	global.log('Start Job');
	global.var.route = [25, 33, 12, 23, 35, 24, 21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 6, 41, 47, 62];
	run(true, ()=>{
		turn(90, ()=>{
			global.var.route = [95]; 
			run(false, ()=>{
				// turn(90, ()=>{
					// lift.process(1, ()=>{
						global.var.route = [0]; 
						run(true, ()=>{
							turn(180, ()=>{
								global.var.route = [41, 6, 40, 31, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35, 23, 12, 33, 25, 26, 38]; 
								run(true, ()=>{
									toBuffer(()=>{
										seeJob();
									});
								});
							}, true);
						});
					// });
				// }, false);
			});
		}, true);
	});
}

let seeJob = ()=>{
	setTimeout(()=>{
		if(global.var.to != null){
			doJob2024();
		}else{
			seeJob();
		}
	}, 3000);
}

setTimeout(()=>{
	// doJob();

	seeJob();
	
},5000);

var pm2 = require('pm2');

// pm2.connect(function(err) {
//   if (err) {
//     console.error(err);
//     process.exit(2);
//   }
  
//   pm2.start({
//     script    : 'py/ar.py',         // Script to be run
//   }, function(err, apps) {
//     pm2.disconnect();   // Disconnects from PM2
//     if (err) throw err
//   });
// });

let fixSpeed = [16, 38];
let nonSafety = [];

let run = (dir = true, callback)=>{
	global.log('Routing ' + JSON.stringify(global.var.route));
	let ar0count = 0;
	let runInter = setInterval(()=>{
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
						global.var.selDeg = parseInt(90 + (a[3] / 3));//a[9];//90 + (a[2] - degNow);//calcErr(a[5]);
						global.var.pidval = parseInt(90 + (a[3] / 3));//a[9];//90 + (a[2] - degNow);//calcErr(a[5]);
					// }else if(a[4] >= -120 && a[4] < 0){
					// 	global.var.selDeg = 180 - a[5];//90 + (a[2] - degNow);//calcErr(a[5]);
					// 	global.var.pidval = 180 - a[5];//90 + (a[2] - degNow);//calcErr(a[5]);
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
				// if(global.var.ar.length > 0){
				// 	if(dir){
				// 		global.var.selDeg = 90 + (global.var.ar[0][2] - degNow);
				// 	}else{
				// 		global.var.selDeg = 90 + (global.var.ar[0][3] / 10);
				// 	}
				// }

				if(ar0count > 20){
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
	let runInter = setInterval(()=>{
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
				clearInterval(runInter);
				global.log('Offset ' + no + ' done.');
				if(callblack){ callblack(); }
			}
		}
	}, 20);
}

let turn = (d, callblack, rd = null)=>{
	global.log('Turning ' + d);
	let turnFlag = true;
	let turnInter = setInterval(()=>{
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
						move.run(true, 70);
					}else{
						move.run(true, 30);
					}
				}
			}else{
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

