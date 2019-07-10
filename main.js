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

let degNow = 180;


let l = 1;
let doJob2 = ()=>{
	global.log('Start Job');
	l = (l == 1 ? 2 : 1);
	global.var.route = [63];
	run(true, ()=>{
		turn(0, ()=>{
			offset(46, ()=>{
				turn(90, ()=>{
					global.var.route = [46];
					run(false, ()=>{
						lift.process(l, ()=>{
							global.log('Lift ' + l);
							offset(64, ()=>{
								turn(180, ()=>{
									doJob2();
								});
							});
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

let doJob3 = ()=>{
	degNow = 0;
	global.var.route = [11, 9];
	run(false, ()=>{
		global.var.route = [15];
		run(true, ()=>{
			doJob3();
		});
	});
}

let doJob4 = ()=>{
	global.log('Start Job');
	global.var.route = [63, 62, 47, 41, 6 ,40, 42]; //[64, 63, 62, 47];//
	run(true, ()=>{
		turn(0, ()=>{
			global.var.route = [6, 41, 47, 62, 63, 64];//[62, 63, 64, 65]; //
			run(true, ()=>{
				turn(180, ()=>{
					doJob4();
				});
			});
		});
	});
}

let doJob5 = ()=>{
	global.log('Start Job');
	global.var.route = [63, 62, 47, 41, 6 ,40, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24, 35]; //[64, 63, 62, 47];//
	// lift.process(1, ()=>{
		run(true, ()=>{
			turn(0, ()=>{
				global.var.route = [21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 6, 41, 47, 62, 63, 64]; //[64, 63, 62, 47];//
				// lift.process(1, ()=>{
					run(true, ()=>{
						turn(180, ()=>{
							doJob5();
						});
					});
				// });
			}, true);
		});
	// });
}

let doJob6 = ()=>{
	degNow = 0;
	global.log('Start Job');
	global.var.route = [21, 37, 43, 36, 45 ,5, 49, 4, 39, 42, 40, 6, 41, 47, 62, 63, 64]; //[64, 63, 62, 47];//
	run(true, ()=>{
		turn(180, ()=>{
			
		});
	});
}

let doJob7 = ()=>{
	degNow = 180;
	global.log('Start Job');
	global.var.route = [35, 23, 12, 33, 25, 26, 38]; //[64, 63, 62, 47];//
	run(true, ()=>{
		global.var.route = [8, 13, 7, 10, 14];
		run(false, ()=>{
			global.var.route = [7, 13, 8];
			run(true, ()=>{
				turn(270, ()=>{
					global.var.route = [16];
					run(true, ()=>{
						turn(0, ()=>{
							global.var.route = [33, 12, 23, 35, 24, 21];
							run(true, ()=>{
								turn(180, ()=>{
									doJob7();
								}, true);
							});
						}, true);
					});
				}, true);
			});
		});
	});
}

let doJob8 = ()=>{
	global.log('Start Job');
	global.var.route = [63, 62, 47, 41, 6 ,40, 42, 39, 4, 49, 5, 45, 36, 43, 37, 21, 24]; 
	run(true, ()=>{
		doJob7();
	});
}

setTimeout(()=>{
	// doJob5();
	// doJob6();
	// doJob7();
	//doJob8();
	// turn(0, ()=>{

	// }, true);
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
			if(global.var.route[0] == 26 || global.var.route[0] == 38){}
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
					if(a[4] < -140){
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
					if(global.var.route.length == 1 && Math.abs(a[4]) < 400){
						if(global.var.route[0] == 38 || global.var.route[0] == 16){ move.run(dir, (dir ? 60 : 40), true); }
						else{
							move.run(dir, 30, true);
						}
					}else{
						if(global.var.route[0] == 26 || global.var.route[0] == 38){ move.run(dir, (dir ? 60 : 40), true); }
						else{ move.run(dir, (dir ? 100 : 60), true); }
					}
				}
			}else{
				// if(global.var.ar.length > 0){
				// 	if(dir){
				// 		global.var.selDeg = 90 + (global.var.ar[0][2] - degNow);
				// 	}else{
				// 		global.var.selDeg = 90 + (global.var.ar[0][3] / 10);
				// 	}
				// }
				global.log('AR 0');
				move.run(dir, (dir ? 60 : 40), false);
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
						move.run(true, 25);
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

