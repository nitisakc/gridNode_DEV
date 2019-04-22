const five = require("johnny-five");

const board = new five.Board({ port: 'tty.usbmodem1421' });

board.on("ready", ()=> {
  let relay = {
    enable: new five.Relay({ pin: "A9", type: "NC" }),
    forward: new five.Relay({ pin: "A15", type: "NC" }),
    backward: new five.Relay({ pin: "A14", type: "NC" }),
    beep: new five.Relay({ pin: "A10", type: "NC" }),
    liftup: new five.Relay({ pin: "A12", type: "NC" }),
    liftdown: new five.Relay({ pin: "A11", type: "NC" }),
    brake: new five.Relay({ pin: "A13", type: "NC" })
  };


  // var motor = new five.Motor(9);
  // motor.start(180);

  board.loop(40, ()=> {
    relay.brake.toggle();
    relay.forward.toggle();
  });

});