const five = require("johnny-five");
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const eight = require("./north-eight.js");
const board = new five.Board({ repl: false, debug: true });

let calcPoten = d3.scaleLinear().domain([150, 855]).range([0, 180]).clamp(true);
let calcDiff = d3.scaleLinear().domain([-90, 90]).range([-20, 20]).clamp(true);

let relay, poten, liftPosUp, liftPosDown, motors, lamp;
let trunMotor = new BTS7960(45, 44, 46);

board.on("exit", ()=> {
  console.log('exit');
});

board.on("ready", ()=> {
  relay = {
    enable: new eight.Relay({ pin: 22 }),
    forward: new eight.Relay({ pin: 23 }),
    backward: new eight.Relay({ pin: 24 }),
    beep: new eight.Relay({ pin: 25 }),
    liftup: new eight.Relay({ pin: 26 }),
    liftdown: new eight.Relay({ pin: 27 })
  };

  lamp = {
    r: new five.Led({ pin: 34 }),
    o: new five.Led({ pin: 35 }),
    g: new five.Led({ pin: 36 }),
    b: new five.Led({ pin: 37 }),
    w: new five.Led({ pin: 38 })
  };

	poten 			  = new five.Sensor({ pin: "A5", freq: 120 });
	liftPosUp 		= new five.Button({ pin: 6, isPullup: true });
	liftPosDown 	= new five.Button({ pin: 7, isPullup: true });

  poten.on("data", function() {
    global.var.currDeg = calcPoten(this.value).toFixed(0);
    let diff = global.var.selDeg - global.var.currDeg;
    global.var.diffDeg = (diff).toFixed(0);//calcDiff(diff).toFixed(0);
    if(global.var.diffDeg < 0){
      trunMotor.start(180);
    }else if(global.var.diffDeg > 0){
      trunMotor.start(180);
    }else{
      trunMotor.stop();
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

	board.loop(50, ()=> {
    speed.accel();
	});

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
  },
  set: (val)=>{
    global.var.setSpd = val;
  }
}

let lift = {
  process: ()=>{
    if(global.var.liftup == 1){ lift.up(); }
    else if(global.var.liftup == 2){ lift.down(); }
    else{ lift.stop(); }
  },
  up: (callback)=>{
    relay.liftdown.off();
    relay.liftup.on();
    let inv = setInterval(()=>{
      if(global.var.liftpos == 1){
        clearInterval(inv);
        lift.stop();
        if(callback){ callback(); }
      }
    }, 100);
  },
  down: ()=>{
    relay.liftup.off();
    relay.liftdown.on();
    let inv = setInterval(()=>{
      if(global.var.liftpos == 2){
        clearInterval(inv);
        lift.stop();
        if(callback){ callback(); }
      }
    }, 100);
  },
  stop: ()=>{
    relay.liftup.off();
    relay.liftdown.off();
  }
}

let other = {
  beep: (bb = false)=>{
    // if(global.var.beep){
      global.var.beep = false;
      relay.beep.on();
      setTimeout(()=>{
        relay.beep.off();
        if(bb){ setTimeout(()=>{ other.beep(); }, 200); }
      },200);
    // }
  }
}

module.exports = { board, relay, lamp, move, speed, lift, other };