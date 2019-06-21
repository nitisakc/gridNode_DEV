(function(exports){

	var between = (x, min, max)=>{
		return x >= min && x <= max;
	};
	exports.between = between;

	exports.roundCompass15 = (int)=>{
		if(int <= 7){ return 0; }
		else if(between(int,8,22)){ return 15; }
		else if(between(int,23,37)){ return 30; }
		else if(between(int,38,52)){ return 45; }
		else if(between(int,523,67)){ return 60; }
		else if(between(int,68,82)){ return 75; }
		else if(between(int,83,97)){ return 90; }
		else if(between(int,98,112)){ return 105; }
		else if(between(int,113,127)){ return 120; }
		else if(between(int,128,142)){ return 135; }
		else if(between(int,143,157)){ return 150; }
		else if(between(int,158,172)){ return 165; }
		else if(between(int,173,187)){ return 180; }
		else if(between(int,188,202)){ return 195; }
		else if(between(int,203,217)){ return 210; }
		else if(between(int,218,232)){ return 225; }
		else if(between(int,233,247)){ return 240; }
		else if(between(int,248,262)){ return 255; }
		else if(between(int,263,277)){ return 270; }
		else if(between(int,278,292)){ return 285; }
		else if(between(int,293,307)){ return 300; }
		else if(between(int,308,322)){ return 315; }
		else if(between(int,323,337)){ return 330; }
		else if(between(int,338,352)){ return 345; }
		else if(int >= 352){ return 0; }
		else {return null; }
	};

}(typeof exports === 'undefined' ? this.calc = {} : exports));