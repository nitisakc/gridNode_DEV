const five = require("johnny-five");
const d3 = require("d3-scale");
const board = new five.Board({ repl: false, debug: true });

let calcVolt = d3.scaleLinear().domain([0, 1024]).range([0, 5]).clamp(true);
board.on("exit", ()=> {
  console.log('exit');
});

board.on("ready", ()=> {
	liftPos         = new five.Sensor({ pin: "A6", freq: 120 });
	liftPos.on("data", function() {
	    console.dir(calcVolt(this.value));
	    
	  });
	// rled = new five.Pin({
	//     pin: 8,
	//     mode: five.Pin.PWM
	// });

	// board.io.pwmWrite(9, 220);

	// let r = new five.Led({ pin: 9 });
	// let g = new five.Led({ pin: 10 });
	// let b = new five.Led({ pin: 11 });
	// r.on();
	// g.on();
	// b.on();

	// board.io.pwmWrite(9, 255);
	// board.io.pwmWrite(10, 20);
	// board.io.pwmWrite(11, 255);
});

// let ar = [
// 	[1],[2]
// ];

// let a = ar.find(d => d[0] == 3);
// console.dir(a);