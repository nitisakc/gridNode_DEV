const five = require("johnny-five");
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const ardu = require("./H-Bridge");
const board = new five.Board({ repl: false, debug: true });

let calcPoten = d3.scaleLinear().domain([150, 855]).range([0, 180]).clamp(true);
let calcDiff = d3.scaleLinear().domain([-90, 90]).range([-10, 10]).clamp(true);

let relay, poten, liftPosUp, liftPosDown, motors, lamp;

board.on("exit", ()=> {
  console.log('exit');
});

board.on("ready", ()=> {
  relay = {
    enable: new ardu.Relay({ pin: 22 }),
    forward: new ardu.Relay({ pin: 23 }),
    backward: new ardu.Relay({ pin: 24 }),
    beep: new ardu.Relay({ pin: 25 }),
    liftup: new ardu.Relay({ pin: 26 }),
    liftdown: new ardu.Relay({ pin: 27 }),
    xx: new ardu.Relay({ pin: 28 }),
    cc: new ardu.Relay({ pin: 29 })
  };

  lamp = {
    r: new five.Led({ pin: 34 }),
    o: new five.Led({ pin: 35 }),
    g: new five.Led({ pin: 36 }),
    b: new five.Led({ pin: 37 }),
    w: new five.Led({ pin: 38 })
  };
  lamp.r.blink();
  lamp.o.blink();
  lamp.g.blink();
  lamp.b.blink();
  lamp.w.blink();

	poten 			= new five.Sensor({ pin: "A5", freq: 120 });
	liftPosUp 		= new five.Button({ pin: 6, isPullup: true });
	liftPosDown 	= new five.Button({ pin: 7, isPullup: true });

  poten.on("data", function() {
    global.var.currDeg = calcPoten(this.value).toFixed(0);
    let diff = global.var.selDeg - global.var.currDeg;
    global.var.diffDeg = (diff).toFixed(0);//calcDiff(diff).toFixed(0);
    if(global.var.diffDeg < 0){
      // motors.forward(180);
    }else if(global.var.diffDeg > 0){
      // motors.reverse(180);
    }else{
      // motors.stop();
    }
  });

	liftPosUp.on("down", 	()=> { 
    global.var.liftpos = 1; 
    global.var.liftup = 0; 
  });
	liftPosUp.on("up", 		()=> { global.var.liftpos = 0; });

	liftPosDown.on("down", 	()=> { 
    global.var.liftpos = 2; 
    global.var.liftup = 0; 
  });
	liftPosDown.on("up", 	()=> { global.var.liftpos = 0; });

	board.loop(40, ()=> {
    speed.accel();

    lift.process();
	});

  setTimeout(()=>{
    global.var.liftup = 2;
    setTimeout(()=>{
      global.var.liftpos = 2; 
      global.var.liftup = 0; 
    },10000);
  }, 3000);

  board.on("exit", ()=> {
    console.log('exit');
  });
});

let move = {
  en: (flag)=>{
    if(flag){ global.var.en = true; relay.enable.on(); }
    else{ global.var.en = false; relay.enable.off(); }
  },
  dir: (fw)=>{
    if(fw){
      relay.backward.off();
      relay.forward.on();
    }else{
      relay.forward.off(); 
      relay.backward.on();
    }
  },
  stop: ()=>{
    relay.enable.off();
    relay.forward.off(); 
    relay.backward.off();
    global.var.currSpd = 0;
    global.var.setSpd = 0;
  }
}

let speed = {
  accel: ()=>{
    let s = global.var.setSpd - global.var.currSpd;
    if(s > 0){
      global.var.currSpd++;
    }else if(s < 0){
      global.var.currSpd--;
    }
  }
}

let lift = {
  process: ()=>{
    if(global.var.liftup == 1){ lift.up(); }
    else if(global.var.liftup == 2){ lift.down(); }
    else{ lift.stop(); }
  },
  up: ()=>{
    relay.liftdown.off();
    relay.liftup.on();
  },
  down: ()=>{
    relay.liftup.off();
    relay.liftdown.on();
  },
  stop: ()=>{
    relay.liftup.off();
    relay.liftdown.off();
  }
}

let other = {
  beep: ()=>{
    // if(global.var.beep){
      global.var.beep = false;
      relay.beep.on();
      setTimeout(()=>{
        relay.beep.off();
      },200);
    // }
  }
}

module.exports = {
  board,
  other
};