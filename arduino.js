const five = require("johnny-five");
const d3 = require("d3-scale");
const calc = require('./utils/calc');
const eight = require("./north-eight.js");
const SerialPort = require('serialport');

// const board = new five.Board({ repl: false, debug: true, port: "/dev/tty.usbmodem1411" });
const board = new five.Board({ repl: false, debug: true, port: "/dev/ttyACM0" });

let calcPoten = d3.scaleLinear().domain([850, 170]).range([0, 180]).clamp(true);
let calcDiffBack = d3.scaleLinear().domain([-90, 90]).range([-40, 40]).clamp(true);
let calcDiff = d3.scaleLinear().domain([-90, 90]).range([-30, 30]).clamp(true);
let calcSpeed = d3.scaleLinear().domain([0, 100]).range([0, 255]).clamp(true);
let calcVolt = d3.scaleLinear().domain([0, 1024]).range([0, 5]).clamp(true);
let calcBatt = d3.scaleLinear().domain([0, 1024]).range([0, 24]).clamp(true);

let relay, poten, reset, liftPosUp, liftPosDown, motors, lamp, trunMotor, rds, batt, safetyLast = false;

board.on("ready", ()=> {
  global.log('Board ready.');
  relay = {
    enable: new eight.Relay({ pin: 22, type: 'LOW' }),
    forward: new eight.Relay({ pin: 23, type: 'LOW' }),
    backward: new eight.Relay({ pin: 24, type: 'LOW' }),
    beep: new eight.Relay({ pin: 25, type: 'LOW' }),
    liftup: new eight.Relay({ pin: 26, type: 'LOW' }),
    liftdown: new eight.Relay({ pin: 27, type: 'LOW' }),
    brake: new eight.Relay({ pin: 28, type: 'LOW' }),
    safety: new eight.Relay({ pin: 29, type: 'LOW' })
  };


  // relay.safety.on(); 

  global.lamp = lamp = {
    r: new five.Led({ pin: 34 }),
    o: new five.Led({ pin: 35 }),
    g: new five.Led({ pin: 36 }),
    b: new five.Led({ pin: 37 }),
    w: new five.Led({ pin: 38 })
  };

  motors        = new five.Motor(4);

  let beeps = {
    a: new five.Led({ pin: 9 }),
    b: new five.Led({ pin: 10 })
  }
  beeps.a.blink(500);
  
  trunMotor     = new eight.BTS7960(45, 47, 44, 46); //use en 45 only
  batt          = new five.Sensor({ pin: "A8", freq: 10 });
  poten         = new five.Sensor({ pin: "A5", freq: 120 });
  liftp         = new five.Sensor({ pin: "A6", freq: 120 });
  reset         = new five.Button({ pin: 8, isPullup: true });
  liftPosUp     = new five.Button({ pin: 5, isPullup: true });
  liftPosDown   = new five.Button({ pin: 6, isPullup: true });
  rds = [ new five.Proximity({ controller: "GP2Y0A41SK0F", pin: "A4" }),
          new five.Proximity({ controller: "GP2Y0A41SK0F", pin: "A7" }) ];

  rds[0].on("data", function() { global.var.rds[0] = parseInt((global.var.rds[0] + this.cm) / 2); });
  rds[1].on("data", function() { global.var.rds[1] = parseInt((global.var.rds[1] + this.cm) / 2); });

  // liftp.on("data", function() {
  //   // console.dir(calcVolt(this.value)); 
  //   if(calcVolt(this.value) > 4){
  //     global.var.liftpos = 2; 
  //   } else if(calcVolt(this.value) < 1.5){
  //     global.var.liftpos = 1; 
  //   }else{
  //     global.var.liftpos = 0; 
  //   }
  //   // global.var.liftpos = calcVolt(this.value);
  // });

  batt.on("data", function() {
    global.var.batt = calcBatt(this.value).toFixed(2);
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

    // if(global.var.safety.on && global.var.safety.danger > 2 && (global.var.selDeg < 140 && global.var.selDeg > 40)){
    //   relay.safety.on(); 
    //   move.stop();
    //   global.var.selSpd = 0;
    //   safetyLast = true;

    //   if(lampStatus.safety == false){ other.beep(); lampStatus.safetyStart(); }  
      
      
    // }else if(global.var.safety.on){
    //   if(safetyLast){
    //     setTimeout(()=>{
    //       relay.safety.off(); 
    //       lampStatus.safetyStop();
    //     }, 2000)
    //   }
    //   safetyLast = false;
    // }
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
    // if(global.var.safety.on && global.var.safety.danger > 0){
    //   move.stop();
    // }else{
    move.en();
    // }
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
    if(global.var.safety.on && global.var.safety.warning > 3 && global.var.en == true && global.var.dir == 1 && (global.var.selDeg < 140 && global.var.selDeg > 40)){
      val = parseInt(val / 1.8);
      val = val < 30 ? 30 : val;
    }

    if(global.var.safety.on && global.var.safety.danger > 2 && global.var.en == true && global.var.dir == 1 && (global.var.selDeg < 140 && global.var.selDeg > 40)){
      val = 0;
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
