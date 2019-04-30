'use strict';
const five = require("johnny-five");

class BTS7960 {
  constructor(enl, enr, pwml, pwmr) {
  	this.pwml = new five.Motor(pwml);
  	this.pwmr = new five.Motor(pwmr);
    this.enl = new five.Pin(enl);
    this.enr = new five.Pin(enr);
    this.enl.low();
    this.enr.low();
  }

  right(pwm = 255){
    this.enl.high();
    this.enr.high();
    this.pwml.start(0);
    this.pwmr.start(pwm);
  }

  lift(pwm = 255){
    this.enl.high();
    this.enr.high();
    this.pwmr.start(0);
    this.pwml.start(pwm);
  }

  stop() {
    this.enl.low();
    this.enr.low();
    this.pwml.stop();
    this.pwmr.stop();
  }
}

class Relay{
	constructor(obj) {
  		this.type = obj.type || 'HIGH'; 
  		this.default  = obj.default || 'OFF'; 
  		this.r = new five.Pin(obj.pin);
  		if(this.default || this.default == "OFF"){ this.off(); }
  		else{ this.on(); }
    }

    on(){ 
   		if(this.type == "HIGH"){ this.r.low(); }
		  else{ this.r.high(); } 
	   }
   	off(){ 
   		if(this.type == "HIGH"){ this.r.high(); }
		  else{ this.r.low(); }
   	}
   	toggle(){ this.r.toggle(); }
}

var ardu = {
	BTS7960: BTS7960,
	Relay: Relay
}

module.exports = ardu;