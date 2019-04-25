'use strict';
const five = require("johnny-five");

class BTS7960 {
  constructor(en, pwml, pwmr) {
  	this.pwml = new five.Motor(pwml);
  	this.pwmr = new five.Motor(pwmr);
    this.en = new five.Pin(en);
    this.en.low();
  }

  right(pwm = 255){
    this.en.high();
    this.pwml.start(0);
    this.pwmr.start(pwm);
  }

  lift(pwm = 255){
    this.en.high();
    this.pwmr.start(0);
    this.pwml.start(pwm);
  }

  stop() {
    this.en.low();
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