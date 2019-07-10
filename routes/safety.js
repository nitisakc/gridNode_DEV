var express = require('express');
const d3 = require("d3-scale");
var router = express.Router();

let calcDeg = d3.scaleLinear().domain([40, 140]).range([-40, 40]).clamp(true);
let calcSpd = d3.scaleLinear().domain([0, 100]).range([30, 80]).clamp(true);
let calcRedSpd = d3.scaleLinear().domain([5, 40]).range([1.0, 0.5]).clamp(true);

router.get('/', function(req, res, next) {
  res.sendfile('www/safety.html');
});

let startx = 200, 
	starty = 200,
	height = 70,
	width = 106,
	angle = -11,
	warning = 140
	offset = 82,
	center = width / 2,
	varea = 12,
	padding = (width - offset) / 2,
	rplr = [startx+padding, starty],
	rpll = [startx+padding+offset, starty];

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
	// global.var.currSpd = 100;
	height = calcSpd(global.var.currSpd);//.toFixed(0);
	warning = height * 2;
	angle = calcDeg(global.var.selDeg);
	let heightRed = height * calcRedSpd(Math.abs(angle));
	let warningRed = warning * calcRedSpd(Math.abs(angle));

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

	if(angle < -5){
		global.var.safety.display.redArea.splice(1, 0, [startx - 5, starty + 80]);
	}else if(angle > 5){
		global.var.safety.display.redArea.splice(3, 0, [startx + width + 5, starty + 80]);
	}

	// global.var.safety.display.redArea = [
	// 	[startx + width + 20, starty - 30],
	// 	[startx + width + 20, starty + 150],
	// 	[startx + width + 170, starty + 150],
	// 	[startx + width + 150, starty + 20],
	// 	[startx + width + 85, starty - 15]
	// ];

	let w = 0, d = 0;
	global.var.safety.display.rplr = rplr;
	global.var.safety.display.rpll = rpll;
	global.var.safety.display.points = [];
	for(i = 0; i < global.var.safety.l.length; i++){
		let point = addPoint(global.var.safety.l[i], 0);
		if(point[2]){ w++; }
		if(point[3]){ d++; }
		global.var.safety.display.points.push(point);
	}
	let rpoints = [];
	for(i = 0; i < global.var.safety.r.length; i++){
		let point = addPoint(global.var.safety.r[i], offset);
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
	let x = startx + parseInt(raw[1] * Math.cos((raw[0]- 90) * Math.PI / 180));
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

router.post('/set/l', function(req, res, next) {
	let body = req.body;
	if(body.length > 0){
		// body.sort((a, b)=>{
		//     if (a[0] < b[0]) return -1;
		//     if (a[0] > b[0]) return 1;
		//     return 0;
		// });
		global.var.safety.l = body;
	}
	res.send(200);
});

router.post('/set/r', function(req, res, next) {
	let body = req.body;
	if(body.length > 0){
		// body.sort((a, b)=>{
		//     if (a[0] < b[0]) return -1;
		//     if (a[0] > b[0]) return 1;
		//     return 0;
		// });
		global.var.safety.r = body;
	}
	res.send(200);
});

calc();

module.exports = router;