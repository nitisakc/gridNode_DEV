var express = require('express');
const d3 = require("d3-scale");
var router = express.Router();

let calcDeg = d3.scaleLinear().domain([40, 140]).range([-40, 40]).clamp(true);
let calcSpd = d3.scaleLinear().domain([0, 100]).range([30, 80]).clamp(true);
let calcRedSpd = d3.scaleLinear().domain([5, 40]).range([1.0, 0.5]).clamp(true);

// router.get('/', function(req, res, next) {
//   res.sendfile('www/safety.html');
// });

let startx = 160, 
	starty = 200,
	height = 40,
	width = 60,
	angle = 0,
	warning = 90,
	offset = 50,
	center = width / 2,
	varea = 12,
	padding = (width - offset) / 2,
	rplr = [startx+padding, starty],
	rpll = [startx+padding+offset, starty],
	rplc = [startx + (center), starty];

let isPip = (point, vs)=>{
    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};


let calc = ()=>{
	// height = calcSpd(global.var.currSpd);//.toFixed(0);
	// warning = height * 2;
	angle = 0;//calcDeg(global.var.selDeg);
	let heightRed = height;// * calcRedSpd(Math.abs(angle));
	let warningRed = warning;// * calcRedSpd(Math.abs(angle));

	global.var.safety.display.yelArea = [
		[startx - padding, starty],
		[startx + angle - padding, starty - warningRed],
		[startx + width + angle + padding, starty - warningRed],
		[startx + width + padding, starty],
		[startx + center, starty - varea]
	];    
	global.var.safety.display.redArea = [
		[startx, starty],
		// [startx, starty],
		[startx + angle, starty - (angle > 5 ? height : heightRed) + (angle/2)],
		[startx + width + angle, starty - (angle < -5 ? height : heightRed) - (angle/2)],
		[startx + width, starty],
		[startx + center, starty - varea]
	];

	let w =0, d = 0;
	global.var.safety.display.rplc = rplc;
	global.var.safety.display.points = [];
	for(i = 0; i < global.var.safety.c.length; i++){
		let point = addPoint(global.var.safety.c[i], 0);
		if(point[2]){ w++; }
		if(point[3]){ d++; }
		global.var.safety.display.points.push(point);
	}
	global.var.safety.warning = w;
	global.var.safety.danger = d;

	if(global.io) global.io.emit('safety', global.var.safety.display);

	setTimeout(()=>{
		calc();
	},150);
}

let addPoint = (raw, off = 0)=>{
	let y = starty + parseInt(raw[1] * Math.sin((raw[0]- 90) * Math.PI / 180));
	let x = startx + (center) + parseInt(raw[1] * Math.cos((raw[0]- 90) * Math.PI / 180));
	let red = false, yel = false;
	x = x + padding + off;
	let len = Math.sqrt(Math.pow(x - rpll[0], 2) + Math.pow(y - rpll[1], 2));
	if(len <= 200){
		yel = isPip([x, y], global.var.safety.display.yelArea);
		red = isPip([x, y], global.var.safety.display.redArea);
		// if(yel){ red = isPip([x, y], global.var.safety.display.redArea); }
	}

	return [x, y, yel, red];
}

router.post('/set', function(req, res, next) {
	let body = req.body;
	if(body.length > 0){
		// body.sort((a, b)=>{
		//     if (a[0] < b[0]) return -1;
		//     if (a[0] > b[0]) return 1;
		//     return 0;
		// });
		global.var.safety.c = body;
	}
	res.send(200);
});

calc();

module.exports = router;