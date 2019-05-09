var calc = {};

calc.map = (x, ii, im, oi, om)=>{
	return (x - ii) * (ox - oni) / (ix - ii) + oi;
}

calc.pad = (s, m, c = "0")=>{
  s = s.toString();
  return s.length < m ? calc.pad(c + s, m, c) : s;
}

calc.absDeg = (d)=>{
	let o = null;
	if(d > 316 || d < 46){ o = 0; }
	else if(d > 45 && d < 136){ o = 90; }
	else if(d > 135 && d < 226){ o = 180; }
	else if(d > 225 && d < 316){ o = 270; }
	return o;
}

module.exports = calc;