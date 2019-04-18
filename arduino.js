const five = require("johnny-five");
const board = new five.Board({ repl: false, debug: false });

board.on("ready", ()=> {
  	let relayEnable 	= new five.Relay({ pin: "A9"  });
  	let relayForward 	= new five.Relay({ pin: "A15" });
  	let relayBackward 	= new five.Relay({ pin: "A14" });
  	let relayBeep		= new five.Relay({ pin: "A10" });
  	let relayLiftup		= new five.Relay({ pin: "A12" });
  	let relayLiftdown	= new five.Relay({ pin: "A11" });

  	let poten 			= new five.Sensor({ pin: "A7" });
  	let liftPosUp 		= new five.Button({ pin: 31, isPullup: true });
  	let liftPosDown 	= new five.Button({ pin: 33, isPullup: true });

	liftPosUp.on("down", 	()=> { global.var.liftpos = 2; });
	liftPosUp.on("up", 		()=> { global.var.liftpos = 0; });

	liftPosDown.on("down", 	()=> { global.var.liftpos = 1; });
	liftPosDown.on("up", 	()=> { global.var.liftpos = 0; });

	board.loop(40, ()=> {
		global.var.liftpos = poten.value;
		// console.log(poten.value);
	});
});


module.exports = board;