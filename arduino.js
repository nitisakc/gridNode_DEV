const five = require("johnny-five");
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const eight = require("./north-eight.js");
const SerialPort = require('serialport');
const config = require('./config/board.json');

const board = new five.Board({ repl: false, debug: true, port: "/dev/cu.wchusbserial1410" });
// const board = new five.Board({ repl: false, debug: true, port: "/dev/ttyACM0" });

let calcPoten = d3.scaleLinear().domain([config.potenCalc.raw[0], config.potenCalc.raw[1]]).range([0, 180]).clamp(true);
let calcDiffBack = d3.scaleLinear().domain([-90, 90]).range([config.potenCalc.bw * -1, config.potenCalc.bw]).clamp(true);
let calcDiff = d3.scaleLinear().domain([-90, 90]).range([config.potenCalc.fw * -1, config.potenCalc.fw]).clamp(true);
let calcSpeed = d3.scaleLinear().domain([0, 100]).range([0, 255]).clamp(true);
let calcVolt = d3.scaleLinear().domain([0, 1024]).range([0, 5]).clamp(true);
let calcBatt = d3.scaleLinear().domain([0, 1024]).range([0, 24]).clamp(true);

let relay, poten, reset, liftPosUp, liftPosDown, motors, lamp, trunMotor, rds, batt, safetyLast = false;
let vchk = false, schk = false;

board.on("ready", ()=> {
  // const compass = new five.Compass({
  //   controller: "MAG3110"
  // });

  // compass.on("change", () => {
  //   const {bearing, heading, raw} = compass;
  //   console.log(bearing);
  //   console.log(heading);
  //   console.log(raw);
  //   console.log(Math.atan2(raw.y, raw.x) * (180 / Math.PI));
  //   // console.log("Compass:");
  //   // console.log("  bearing     : ", bearing);
  //   // console.log("  heading     : ", heading);
  //   // console.log("--------------------------------------");
  // });

  global.log('Board ready.');
  relay = {
    enable: new eight.Relay({ pin: config.relay.enable, type: 'LOW' }),
    forward: new eight.Relay({ pin: config.relay.forward, type: 'LOW' }),
    backward: new eight.Relay({ pin: config.relay.backward, type: 'LOW' }),
    liftup: new eight.Relay({ pin: config.relay.liftup, type: 'LOW' }),
    liftdown: new eight.Relay({ pin: config.relay.liftdown, type: 'LOW' }),
    brake: new eight.Relay({ pin: config.relay.brake, type: 'LOW' }),
    beep: new eight.Relay({ pin: config.relay.beep, type: 'LOW' })
  };

  // relay.safety.on(); 

  global.lamp = lamp = {
    r: new five.Led({ pin: config.lamp.r }),
    o: new five.Led({ pin: config.lamp.o }),
    g: new five.Led({ pin: config.lamp.g }),
    b: new five.Led({ pin: config.lamp.b }),
    w: new five.Led({ pin: config.lamp.w })
  };

  motors        = new five.Motor(config.spd);

  let beeps = {
    a: new five.Led({ pin: config.beeps.a }),
    b: new five.Led({ pin: config.beeps.b })
  }
  beeps.a.blink(500);
  
  trunMotor     = new eight.BTS7960(config.trun[0], config.trun[1], config.trun[2], config.trun[3]); //use en 45 only
  batt          = new five.Sensor({ pin: config.batt, freq: 10 });
  poten         = new five.Sensor({ pin: config.poten.pin, freq: config.poten.freq });
  reset         = new five.Button({ pin: config.reset, isPullup: true });
  liftPosUp     = new five.Button({ pin: config.liftPosUp, isPullup: true });
  liftPosDown   = new five.Button({ pin: config.liftPosDown, isPullup: true });
  rds = [ new five.Proximity({ controller: "GP2Y0A41SK0F", pin: config.rds[0] }),
          new five.Proximity({ controller: "GP2Y0A41SK0F", pin: config.rds[1] }) ];

  rds[0].on("data", function() { global.var.rds[0] = parseInt((global.var.rds[0] + this.cm) / 2); });
  rds[1].on("data", function() { global.var.rds[1] = parseInt((global.var.rds[1] + this.cm) / 2); });

  batt.on("data", function() {
    global.var.batt = calcBatt(this.value).toFixed(2);
    if(global.var.batt < 5 && vchk){
      vchk = false;
      global.log('Voltage drops');
    }else{
      vchk = true;
    }
  });

  poten.on("data", function() {
    global.var.poten = this.value;
    global.var.currDeg = calcPoten(this.value).toFixed(0);
    let sdeg = global.var.pidon ? global.var.pidval : global.var.selDeg;
    let diff = sdeg - global.var.currDeg;
    global.var.diffDeg = (diff).toFixed(0);//calcDiff(diff).toFixed(0);
    let d = global.var.dir == 2 ? calcDiffBack(diff).toFixed(0) : calcDiff(diff).toFixed(0);
    if(d < -1){
      trunMotor.left(255);
    }else if(d > 1){
      trunMotor.right(255);
    }else{
      trunMotor.stop();
    }
  });

  reset.on("press",  ()=> { 
    // console.log("reset press");
    global.log('Reset press');
    global.var.en = false;
    global.var.dir = 0; 
    relay.enable.off(); 
    relay.brake.off(); 
    
    global.var.currSpd = 0;
    global.var.selSpd = 0;
    motors.stop();
  });

  liftPosUp.on("press",   ()=> { 
    global.var.liftpos = 1; 
    // console.log("liftPosUp press");
    // global.var.liftup = 0; 
  });
  liftPosUp.on("release",     ()=> { 
    global.var.liftpos = 0;
    // console.log("liftPosUp release"); 
  });

  liftPosDown.on("press",   ()=> { 
    global.var.liftpos = 2; 
    // console.log("liftPosDown press");
    // global.var.liftup = 0; 
  });
  liftPosDown.on("release",   ()=> { 
    global.var.liftpos = 0; 
    // console.log("liftPosDown release");
  });

  board.loop(40, ()=> {
    if(global.var.ar && global.var.ar.length > 0){ global.var.deg = global.var.ar[0][2]; }
    if(global.var.selSpd > 0 && global.var.en == true && global.var.dir != 0){ beeps.b.off(); }
    else{ beeps.b.on(); }

    move.accel();

    if(lampStatus.safety == false){
      if(global.var.en && global.var.dir != 0){
        if(Math.abs(global.var.diffDeg) > 30){
          lampStatus.danger();
        }else{
          lampStatus.warning();
        }
      }else{
        if(!global.var.ready){
          lampStatus.notready();
        }else{  
          lampStatus.standby();
        }
      }
    }
  });

  board.on("exit", ()=> {
    console.log('board exit');
  });

  board.on("close", ()=> {
    console.log('board close');
  });

  board.on("message", function(event) {
    console.log("Received a %s message, from %s, reporting: %s", event.type, event.class, event.message);
  });
});

let lampStatus = {
  safety: false,
  safetyStart: ()=>{
    lampStatus.safety = true;
    lamp.r.blink(250);
    setTimeout(()=>{
      lamp.o.blink();
    }, 250);
    lamp.g.off();
  },
  safetyStop: ()=>{
    lampStatus.safety = false;
    lamp.r.stop();
    lamp.o.stop();
  },
  danger: ()=>{
    lamp.r.on();
    lamp.o.off();
    lamp.g.off();
  },
  warning: ()=>{
    lamp.r.off();
    lamp.o.on();
    lamp.g.off();
  },
  standby: ()=>{
    lamp.r.off();
    lamp.o.off();
    lamp.g.on();
  },
  notready: ()=>{
    lamp.r.off();
    lamp.o.on();
    lamp.g.on();
  }
};

let move = {
  run: (fw, spd, pid = false)=>{
    move.pid(pid); 
    move.dir(fw);
    move.en();
    move.speed(spd);
  },
  pid: (onoff = true)=>{
    global.var.pidon = onoff; 
  },
  en: (flag = true)=>{
    if(flag && lampStatus.safety == false){ 
      // if(global.var.dir != 0){
        global.var.en = true; 
        relay.enable.on(); 
        relay.brake.on(); 
        // relay.emg.on(); 
      // } 
    }
    else{ 
      global.var.en = false; 
      relay.enable.off(); 
      relay.brake.off(); 
      // relay.emg.off(); 
      global.var.currSpd = 0;
      global.var.selSpd = 0;
    }
  },
  dir: (fw)=>{
    if(fw){
      global.var.dir = 1;
      relay.backward.off();
      relay.forward.on();
    }else{
      global.var.dir = 2;
      relay.forward.off(); 
      relay.backward.on();
    }
  },
  stop: ()=>{
    move.pid(false); 
    move.en(false);
    relay.forward.off(); 
    relay.backward.off();
    global.var.dir = 0;
  },
  speed: (val)=>{
    if(global.var.safety.on && global.var.safety.warning > config.speedReduce.warning && global.var.en == true && global.var.dir == 1 && (global.var.selDeg < (config.speedReduce.deg + 90) && global.var.selDeg > (config.speedReduce.deg - 90))){
      val = parseInt(val / config.speedReduce.ratio);
      val = val < config.speedReduce.min ? config.speedReduce.min : val;
    }

    if(global.var.safety.on && global.var.safety.danger > config.speedReduce.danger && global.var.en == true && global.var.dir == 1 && (global.var.selDeg < (config.speedReduce.deg + 90) && global.var.selDeg > (config.speedReduce.deg - 90))){
      val = 0;
      if(schk){
        schk = false;
        global.log('Safety on');
      }else{
        schk = true;
      }
    }

    global.var.selSpd = val;
  },
  accel: ()=>{
    let s = global.var.selSpd - global.var.currSpd;

    if(global.var.en && global.var.dir != 0){
      if(s > 0){
        global.var.currSpd = global.var.currSpd + 1;
      }else if(s < 0){
        global.var.currSpd = global.var.currSpd - 1;
      }
      // global.var.currSpd = parseInt(global.var.currSpd+"");
      if(global.var.currSpd < 5){
        motors.stop();
        // board.io.pwmWrite(4, 0);
      }else{
        motors.start(calcSpeed(global.var.currSpd));
        // board.io.pwmWrite(4, calcSpeed(global.var.currSpd));
      }
    }else{
      global.var.selSpd = 0;
      global.var.currSpd = 0;
      motors.stop();
      // board.io.pwmWrite(4, 0);
    }
    // console.log(global.var.currSpd);
  }
}

let lift = {
  process: (val, callback)=>{
    global.var.liftup = val;
    if(global.var.liftup == 1){ lift.up(callback); }
    else if(global.var.liftup == 2){ lift.down(callback); }
    else{ lift.stop();  }
  },
  up: (callback)=>{
    global.var.liftup = 1;
    relay.liftdown.off();
    relay.liftup.on();
    let inv = setInterval(()=>{
      if(global.var.liftpos == 1){
        global.log('Lift up');
        clearInterval(inv);
        lift.stop();
        if(callback){ callback(); }
      }
    }, 100);
  },
  down: (callback)=>{
    let co = 0;
    global.var.liftup = 2;
    relay.liftup.off();
    relay.liftdown.on();
    let inv = setInterval(()=>{
      if(global.var.liftpos == 2){
        co++;
        if(co > 5){
          global.log('Lift down');
          co = 0;
          clearInterval(inv);
          lift.stop();
          if(callback){ callback(); }
        }
      }
    }, 100);
  },
  stop: ()=>{
    global.var.liftup = 0;
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

module.exports = { board, relay, lamp, move, lift, other };
