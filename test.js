const five = require("johnny-five");
const ardu = require("./H-Bridge");

const board = new five.Board();


board.on("ready", ()=> {
  let relay = {
    enable: new ardu.Relay({ pin: 22, type: "NO" })
  };

  this.r = new five.Pin(obj.pin);
  this.r.on(); 

  // var motorsR = new five.Motors([{ pins: { enable: 12, pwm: 11 }, invertPWM: false }]);
  // var motorsL = new five.Motors([{ pins: { enable: 4, pwm: 5 }, invertPWM: false }]);
  // var motor = new five.Motor(9);
  let speed = new five.Motor({ pins: { enable: 8, pwm: 9 }});

  board.loop(40, ()=> {
    relay.brake.toggle();
    relay.forward.toggle();

     speed.start(200);
    speed.stop();

    // motorsR.forward(255);
     // motorsL.stop();
    // motorsL.forward(255);
     // motorsR.stop();
  });

});