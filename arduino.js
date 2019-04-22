const five = require("johnny-five");
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const board = new five.Board({ repl: false, debug: true });

let calcPoten = d3.scaleLinear().domain([150, 855]).range([0, 180]).clamp(true);
let calcDiff = d3.scaleLinear().domain([-90, 90]).range([-10, 10]).clamp(true);

board.on("ready", ()=> {
  let relay = {
    enable: new five.Relay({ pin: "A9", type: "NC" }),
    forward: new five.Relay({ pin: "A15", type: "NC" }),
    backward: new five.Relay({ pin: "A14", type: "NC" }),
    beep: new five.Relay({ pin: "A10", type: "NC" }),
    liftup: new five.Relay({ pin: "A12", type: "NC" }),
    liftdown: new five.Relay({ pin: "A11", type: "NC" })
  };

	let poten 			= new five.Sensor({ pin: "A7", freq: 120 });
	let liftPosUp 		= new five.Button({ pin: 31, isPullup: true });
	let liftPosDown 	= new five.Button({ pin: 33, isPullup: true });

  poten.on("data", function() {
    global.var.currDeg = calcPoten(this.value).toFixed(0);
    let diff = global.var.selDeg - global.var.currDeg;
    global.var.diffDeg = (diff).toFixed(0);//calcDiff(diff).toFixed(0);
  });

	liftPosUp.on("down", 	()=> { 
    console.info('liftPosUp down');
    global.var.liftpos = 2; 
    global.var.liftup = 0; 
  });
	liftPosUp.on("up", 		()=> { global.var.liftpos = 0; });

	liftPosDown.on("down", 	()=> { 
    console.info('liftPosDown down');
    global.var.liftpos = 1; 
    global.var.liftup = 0; 
  });
	liftPosDown.on("up", 	()=> { global.var.liftpos = 0; });

	board.loop(40, ()=> {
    if(global.var.liftup == 1){ relay.liftdown.off(); relay.liftup.on(); }
    else if(global.var.liftup == 2){ relay.liftup.off(); relay.liftdown.on(); }
    else{ relay.liftdown.off(); relay.liftup.off(); }

    if(global.var.en){
      relay.enable.on();
      if(global.var.dirfw){
        relay.backward.off();
        relay.forward.on();
      }else{
        relay.forward.off(); 
        relay.backward.on();
      }
    }else{
      relay.enable.off();
      relay.forward.off(); 
      relay.backward.off();
    } 

    if(global.var.liftup == 1){
      relay.liftdown.off();
      relay.liftup.on();
    }else if(global.var.liftup == 2){
      relay.liftup.off();
      relay.liftdown.on();
    }else{
      relay.liftup.off();
      relay.liftdown.off();
    }

    if(global.var.beep){
      global.var.beep = false;
      relay.beep.on();
      setTimeout(()=>{
        relay.beep.off();
      },200);
    }
	});
});

module.exports = board;