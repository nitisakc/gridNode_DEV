var calc = {};

calc.map = (x, ii, im, oi, om)=>{
	return (x - ii) * (ox - oni) / (ix - ii) + oi;
}

calc.pad = (s, m, c = "0")=>{
  s = s.toString();
  return s.length < m ? calc.pad(c + s, m, c) : s;
}

module.exports = calc;