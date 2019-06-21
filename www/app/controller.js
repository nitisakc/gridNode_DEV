

var app = angular.module('APP', []);
app.controller('mainCtrl', function($scope) {
	var svg = d3.select("svg"),
		    width = +svg.attr("width"),
		    height = +svg.attr("height"),
		    xlen = 520,
		    ylen = 140,
		    girds = [],
		    girdSize = 10
		    box = [{x1:0,y1:38,x2:33,y2:38},{x1:33,y1:7,x2:33,y2:38},{x1:33,y1:7,x2:130,y2:7},{x1:130,y1:0,x2:130,y2:7},{x1:130,y1:0,x2:198,y2:0},{x1:198,y1:0,x2:198,y2:68},{x1:0,y1:53,x2:33,y2:53},{x1:33,y1:53,x2:33,y2:128},{x1:33,y1:128,x2:54,y2:128},{x1:54,y1:128,x2:54,y2:136},{x1:54,y1:136,x2:150,y2:136},{x1:150,y1:128,x2:150,y2:136},{x1:150,y1:128,x2:175,y2:128},{x1:175,y1:83,x2:175,y2:128},{x1:175,y1:83,x2:198,y2:83},{x1:66,y1:67,x2:66,y2:67},{x1:99,y1:67,x2:99,y2:67},{x1:133,y1:67,x2:133,y2:67},{x1:166,y1:67,x2:166,y2:67},{x1:39,y1:76,x2:54,y2:126},{x1:67,y1:68,x2:81,y2:126},{x1:88,y1:76,x2:103,y2:122},{x1:111,y1:76,x2:126,y2:122},{x1:135,y1:76,x2:150,y2:126},{x1:157,y1:76,x2:168,y2:120},{x1:115,y1:16,x2:130,y2:40},{x1:145,y1:9,x2:160,y2:45},{x1:177,y1:9,x2:192,y2:62},{x1:45,y1:34,x2:55,y2:44},{x1:45,y1:21,x2:55,y2:31},{x1:45,y1:9,x2:55,y2:18},{x1:82,y1:34,x2:92,y2:44},{x1:82,y1:21,x2:92,y2:31},{x1:82,y1:9,x2:92,y2:18},{x1:95,y1:9,x2:105,y2:18},{x1:95,y1:21,x2:105,y2:31},{x1:95,y1:34,x2:105,y2:44},{x1:119,y1:58,x2:126,y2:66},{x1:199,y1:83,x2:259,y2:83},{x1:199,y1:57,x2:206,y2:57},{x1:206,y1:15,x2:206,y2:57},{x1:206,y1:15,x2:250,y2:15},{x1:250,y1:15,x2:250,y2:63},{x1:250,y1:63,x2:259,y2:63},{x1:259,y1:63,x2:259,y2:68},{x1:220,y1:20,x2:220,y2:20},{x1:220,y1:36,x2:220,y2:36},{x1:236,y1:36,x2:236,y2:36},{x1:260,y1:63,x2:275,y2:63},{x1:275,y1:63,x2:277,y2:63},{x1:277,y1:52,x2:277,y2:63},{x1:275,y1:52,x2:277,y2:52},{x1:275,y1:8,x2:275,y2:63},{x1:275,y1:8,x2:458,y2:8},{x1:458,y1:8,x2:458,y2:53},{x1:435,y1:49,x2:458,y2:49},{x1:435,y1:8,x2:435,y2:49},{x1:260,y1:83,x2:266,y2:83},{x1:266,y1:83,x2:266,y2:90},{x1:260,y1:90,x2:266,y2:90},{x1:260,y1:83,x2:260,y2:128},{x1:260,y1:128,x2:458,y2:128},{x1:458,y1:63,x2:458,y2:128},{x1:453,y1:63,x2:458,y2:63},{x1:453,y1:63,x2:453,y2:69},{x1:453,y1:69,x2:458,y2:69},{x1:283,y1:10,x2:311,y2:63},{x1:317,y1:10,x2:347,y2:63},{x1:351,y1:10,x2:380,y2:63},{x1:384,y1:10,x2:432,y2:63},{x1:274,y1:83,x2:291,y2:95},{x1:274,y1:99,x2:294,y2:108},{x1:274,y1:113,x2:313,y2:125},{x1:321,y1:78,x2:348,y2:100},{x1:321,y1:110,x2:348,y2:125},{x1:356,y1:78,x2:367,y2:128},{x1:375,y1:78,x2:390,y2:128},{x1:398,y1:78,x2:413,y2:128},{x1:421,y1:78,x2:432,y2:128},{x1:440,y1:78,x2:451,y2:128}],
		    point = [{ id: 1, x: 45, y: 53 },{ id: 2, x: 62, y: 53 },{ id: 3, x: 62, y: 74 },{ id: 4, x: 62, y: 94, status: 'r' },{ id: 5, x: 62, y: 114, status: 'r' },{ id: 6, x: 62, y: 131 },{ id: 7, x: 68, y: 53 },{ id: 8, x: 68, y: 34, status: 'k' },{ id: 9, x: 68, y: 15, status: 'y' }],
		    mouse = { x: null, y: null },
		    cars = [],//[{x: 45,y: 54, z: 90, f: 1, b: 1},{x: 82,y: 54, z: 90, f: 1, b: 0},{x: 68,y: 34, z: 0, f: 0, b: 0}],
		    pan = {k: 1, x: 0, y: 0}
		    cctv = [{ ip: 23, x: 68, y: 22, zx: 62, zy: 48 },{ ip: 24, x: 33, y: 54, zx: 64, zy: 47 }],
		    lane = [{ type: 'lane',x1:45,y1:53,x2:173,y2:53 }, { type: 'lane',x1:45,y1:49,x2:132,y2:49 },{ type: 'lane',x1:173,y1:7,x2:173,y2:78 },{ type: 'lane',x1:173,y1:73,x2:275,y2:73 },{ type: 'lane',x1:275,y1:68,x2:275,y2:73 },{ type: 'lane',x1:275,y1:68,x2:448,y2:68 },{ type: 'lane',x1:275,y1:73,x2:448,y2:73 },{ type: 'lane',x1:448,y1:58,x2:448,y2:73 },{ type: 'lane',x1:442,y1:58,x2:442,y2:73 },{ type: 'lane',x1:442,y1:58,x2:460,y2:58 },{ type: 'lane',x1:228,y1:19,x2:228,y2:73 },{ type: 'lane',x1:228,y1:68,x2:244,y2:68 },{ type: 'lane',x1:244,y1:68,x2:244,y2:73 },{ type: 'lane',x1:62,y1:49,x2:62,y2:130 },{ type: 'lane',x1:68,y1:12,x2:68,y2:53 },{ type: 'lane',x1:53,y1:49,x2:53,y2:53 },{ type: 'lane',x1:45,y1:49,x2:45,y2:53 },{ type: 'lane',x1:76,y1:49,x2:76,y2:53 },{ type: 'lane',x1:84,y1:49,x2:84,y2:53 },{ type: 'lane',x1:92,y1:49,x2:92,y2:53 },{ type: 'lane',x1:100,y1:49,x2:100,y2:53 },{ type: 'lane',x1:108,y1:49,x2:108,y2:53 },{ type: 'lane',x1:116,y1:49,x2:116,y2:53 },{ type: 'lane',x1:124,y1:49,x2:124,y2:53 },{ type: 'lane',x1:132,y1:49,x2:132,y2:53 },{ type: 'lane',x1:148,y1:53,x2:148,y2:58 },{ type: 'lane',x1:156,y1:53,x2:156,y2:58 },{ type: 'lane',x1:164,y1:53,x2:164,y2:58 },{ type: 'lane',x1:148,y1:58,x2:173,y2:58 },{ type: 'lane',x1:236,y1:68,x2:236,y2:73 },{ type: 'lane',x1:283,y1:68,x2:283,y2:73 },{ type: 'lane',x1:291,y1:68,x2:291,y2:73 },{ type: 'lane',x1:299,y1:68,x2:299,y2:73 },{ type: 'lane',x1:307,y1:68,x2:307,y2:73 },{ type: 'lane',x1:315,y1:68,x2:315,y2:73 },{ type: 'lane',x1:323,y1:68,x2:323,y2:73 },{ type: 'lane',x1:331,y1:68,x2:331,y2:73 },{ type: 'lane',x1:339,y1:68,x2:339,y2:73 },{ type: 'lane',x1:347,y1:68,x2:347,y2:73 },{ type: 'lane',x1:355,y1:68,x2:355,y2:73 },{ type: 'lane',x1:363,y1:68,x2:363,y2:73 },{ type: 'lane',x1:371,y1:68,x2:371,y2:73 },{ type: 'lane',x1:379,y1:68,x2:379,y2:73 },{ type: 'lane',x1:387,y1:68,x2:387,y2:73 },{ type: 'lane',x1:395,y1:68,x2:395,y2:73 },{ type: 'lane',x1:403,y1:68,x2:403,y2:73 },{ type: 'lane',x1:411,y1:68,x2:411,y2:73 },{ type: 'lane',x1:419,y1:68,x2:419,y2:73 },{ type: 'lane',x1:427,y1:68,x2:427,y2:73 },{ type: 'lane',x1:435,y1:68,x2:435,y2:73 },{ type: 'lane',x1:181,y1:73,x2:181,y2:78 },{ type: 'lane',x1:189,y1:73,x2:189,y2:78 },{ type: 'lane',x1:197,y1:73,x2:197,y2:78 },{ type: 'lane',x1:205,y1:73,x2:205,y2:78 },{ type: 'lane',x1:213,y1:73,x2:213,y2:78 },{ type: 'lane',x1:173,y1:78,x2:213,y2:78 }];

	$scope.pointData = [];

	function pad(n, width, z) {
	  z = z || '0';
	  n = n + '';
	  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function convertCompass(deg){
		let c;
		if(deg >= 8 && deg <= 22){ c = 75; }
		if(deg >= 23 && deg <= 37){ c = 90; }
		if(deg >= 38 && deg <= 52){ c = 105; }
		if(deg >= 53 && deg <= 67){ c = 120; }
		if(deg >= 68 && deg <= 82){ c = 135; }
		if(deg >= 83 && deg <= 97){ c = 150; }
		if(deg >= 98 && deg <= 112){ c = 165; }
		if(deg >= 113 && deg <= 127){ c = 180; }
		if(deg >= 128 && deg <= 142){ c = 195; }
		if(deg >= 143 && deg <= 157){ c = 210; }
		if(deg >= 158 && deg <= 172){ c = 225; }
		if(deg >= 173 && deg <= 187){ c = 240; }
		if(deg >= 188 && deg <= 202){ c = 255; }
		if(deg >= 203 && deg <= 217){ c = 270; }
		if(deg >= 218 && deg <= 232){ c = 285; }
		if(deg >= 233 && deg <= 247){ c = 300; }
		if(deg >= 248 && deg <= 262){ c = 315; }
		if(deg >= 263 && deg <= 277){ c = 330; }
		if(deg >= 278 && deg <= 292){ c = 345; }
		if(deg >= 293 && deg <= 307){ c = 0; }
		if(deg >= 308 && deg <= 322){ c = 15; }
		if(deg >= 323 && deg <= 337){ c = 30; }
		if(deg >= 338 && deg <= 352){ c = 45; }
		if(deg >= 353 && deg <= 7){ c = 60; }
		return c;
	}
	function isXY(arr, x, y) { 
	    return arr.find( d => d.x == x && d.y == y );
	}

	$scope.carCtrl = {
		carData: [],
		gcar: null,
		init: (c)=>{
			var k = 7;
			$scope.carCtrl.gcar = svg.append("g").attr('class','gcar');
			for(i = 0; i < c.length; i++){   
				$scope.carCtrl.carData.push({ 
					id: i, 
					pos: [c[i].x, c[i].y],
					x: (c[i].x * girdSize) - ((k/2) * girdSize) + k - 2, 
					y: (c[i].y * girdSize) - ((k/2) * girdSize) + k - 2,
					z: c[i].z,
					f: c[i].f,
					b: c[i].b
				});
			}
			$scope.carCtrl.create($scope.carCtrl.carData);
		},
		create: (c)=>{
			var k = 7;
			$scope.carCtrl.gcar.selectAll("image")
			    .data(c)
			  .enter().append("image")
			  	.attr('class','car')
			  	.attr('cid', d=> d.id)
			  	.attr('pos', d=> d.pos)
			  	// .attr("xlink:href", d=> "./img/car/" + pad(d.z,3) +d.f+''+d.b+".png")
			    .attr("x", d=> d.x)
				.attr("y", d=> d.y)
				.attr("width", k * girdSize)
				.attr("height", k * girdSize)
				.on("click", (d)=>{
				});
		},
		createOne: (data)=>{
			var k = 7;
			$scope.carCtrl.gcar.append("image")
			  	.attr('class','car')
			  	.attr('cid', data.id)
			  	.attr('pos', data.pos)
			  	.attr("xlink:href", "./img/car/" + pad(data.pos.z,3) + (data.pallet.f ? '1' : '0') + (data.pallet.b ? '1' : '0') + ".png")
			    .attr("x", (data.pos.x * girdSize) - ((k/2) * girdSize) + k - 2)
				.attr("y", (data.pos.y * girdSize) - ((k/2) * girdSize) + k - 2)
				.attr("width", k * girdSize)
				.attr("height", k * girdSize)
				.on("click", (d)=>{
				});
		},
		move: (data)=>{
			var k = 7;
			// setInterval(function(){
			var sel = d3.selectAll('image.car[cid="'+data.id+'"').size();
			if(sel <= 0){
				$scope.carCtrl.createOne(data);
			}else{
				d3.select('image.car[cid="'+data.id+'"')
					.attr("x", (data.pos.x * girdSize) - ((k/2) * girdSize) + k - 2)
					.attr("y", (data.pos.y * girdSize) - ((k/2) * girdSize) + k - 2)
					.attr("xlink:href", "./img/car/" + pad(data.pos.z,3) + (data.pallet.f ? '1' : '0') + (data.pallet.b ? '1' : '0') + ".png");
			}
			// },5)
		},
		rotate: (id, de)=>{
			setInterval(function(){
				d3.select('image.car[cid="'+id+'"]')
					.attr("xlink:href", "./img/car/" + pad(de,3) + "00.png");
			},5)
		}
	}


	$scope.walkable = {
		data: [],
		init: (d)=>{
			// i(d){ $scope.walkable.data = d; }
			$scope.gwalk.selectAll("rect")
					.data($scope.walkable.data)
		  		.enter().append("rect")
					.attr('pos', d=> [d.x, d.y])
					.attr("x", d=> (d.x * girdSize))
					.attr("x", d=> (d.y * girdSize))
					.attr("width", 10)
					.attr("height", 10)
					.attr("fill", "#C0D0FF");
		},
		at: (x, y, f)=>{
			if(!f){
				$scope.gwalk.append("rect")
					.attr('pos', [x,y])
					.attr("x", (x * girdSize))
					.attr("x", (y * girdSize))
					.attr("width", 10)
					.attr("height", 10)
					.attr("fill", "#C0D0FF");
			}else{
				
			}
		}
	}

	$scope.init = ()=>{
		for (i = 0; i < lane.length; i++) {
			if(isXY(point, lane[i].x1,lane[i].y1 ) == undefined){
				point.push({ id: point.length+1, x: lane[i].x1, y: lane[i].y1 });
			}
			if(isXY(point, lane[i].x2,lane[i].y2 ) == undefined){
				point.push({ id: point.length+1, x: lane[i].x2, y: lane[i].y2 });
			}
		}

		console.log(JSON.stringify(point));

		for(i = 0; i < point.length; i++){   
			var s = point[i].status; if(point[i].status == undefined){ s = 'g'; } 
			$scope.pointData.push({ 
				id: i, 
				pos: point[i].x + ',' + point[i].y, 
				status: s, 
				x: (point[i].x * girdSize) - (girdSize / 2), 
				y: (point[i].y * girdSize) - (girdSize / 2) 
			});
		}
		//create grid
		for(xi = 0; xi < xlen; xi++){ girds.push({ x1: xi * girdSize, y1: 0, x2: xi * girdSize, y2: ylen * girdSize }); }
		for(yi = 0; yi < ylen; yi++){ girds.push({ x1: 0, y1: yi * girdSize, x2: xlen * girdSize, y2: yi * girdSize }); }	

		box = box.concat(lane);

		var gline = svg.append("g");

		gline.selectAll("line")
		    .data(girds)
		  .enter().append("line")
		    .attr("x1", d=> d.x1)
		    .attr("y1", d=> d.y1)
		    .attr("x2", d=> d.x2)
		    .attr("y2", d=> d.y2)
			.attr('stroke', '#919191')
			.attr('stroke-width', '0.4');

		$scope.gwalk  = svg.append("g");

		var gshadow = svg.append("g");
		gshadow.selectAll("rect")
		    .data(box)
		  .enter().append("rect")
		    .attr("x", d=> (d.x1 * girdSize) - (2 * girdSize))
			.attr("y", d=> (d.y1 * girdSize) - (2 * girdSize))
			.attr("width", d=> ((d.x2 - d.x1) * girdSize + girdSize) + (4 * girdSize))
			.attr("height", d=> ((d.y2 - d.y1) * girdSize + girdSize) + (4 * girdSize))
			// .attr("fill", "#C0D0FF")
			.attr("fill", d=> d.type == 'lane' ? "rgba(236, 203, 98, 0.3)" : "#C0D0FF")
		    .call(d3.zoom()
		        .scaleExtent([1 / 20, 6])
		        .on("zoom", zoomed));
		var gbox = svg.append("g");
		gbox.selectAll("rect")
		    .data(box)
		  .enter().append("rect")
		    .attr("x", d=> d.x1 * girdSize)
			.attr("y", d=> d.y1 * girdSize)
			.attr("width", d=> (d.x2 - d.x1) * girdSize + girdSize)
			.attr("height", d=> (d.y2 - d.y1) * girdSize + girdSize)
			.attr("fill", d=> d.type == 'lane' ? "rgba(98, 226, 98, 0.6)" : "#2378ae")
		    .call(d3.zoom()
		        .scaleExtent([1 / 20, 6])
		        .on("zoom", zoomed));
		
		svg.append("rect")
		    .attr("width", width)
		    .attr("height", height)
		    .style("fill", "none")
		    .style("pointer-events", "all")
		    .call(d3.zoom()
		        .scaleExtent([1 / 20, 6])
		        .on("zoom", zoomed));

		// var glane = svg.append("g");
		// glane.selectAll("rect")
		//     .data(lane)
		//   .enter().append("rect")
		//   	.attr('class','lane')
		//     .attr("x", d=> d.x1 * girdSize)
		// 	.attr("y", d=> d.y1 * girdSize)
		// 	.attr("width", d=> (d.x2 - d.x1) * girdSize + girdSize)
		// 	.attr("height", d=> (d.y2 - d.y1) * girdSize + girdSize)
		// 	.attr("fill", "rgba(98, 226, 98, 0.6)")
		//     .call(d3.zoom()
		//         .scaleExtent([1 / 20, 6])
		//         .on("zoom", zoomed));

		//cctv
		var gcctv = svg.append("g").attr('class','cctv');
		gcctv.selectAll("image")
		    .data(cctv)
		  .enter().append("image")
		  	.attr("xlink:href","./img/camera-icon.png")
		    .attr("x", d=> (d.x * girdSize) + (7))
			.attr("y", d=> (d.y * girdSize) + (7))
			.attr("width", 16)
			.attr("height", 16)
			.on("click", (d)=>{
				console.log(d);
				var c = gcctv.select('#rect'+d.ip+'');
				var attr = c.attr("display");
				gcctv.selectAll("rect")
					.attr("display", 'none');
				if(attr == 'none'){ c.attr("display", ''); }
				else{ c.attr("display", 'none'); }
			});
		gcctv.selectAll("rect")
		    .data(cctv)
		  .enter().append("rect")
		  	.attr('id', d=> 'rect'+d.ip)
		  	.attr('class','zcctv')
		  	.attr("display", 'none')
		    .attr("x", d=> (d.zx * girdSize) - (2 * girdSize))
			.attr("y", d=> (d.zy * girdSize) - (2 * girdSize))
			.attr("width", girdSize * 20)
			.attr("height", girdSize * 20)
			.attr("fill", "RGBA(216,156,86,0.2)");


		//point
	 	var dragX, dragY;
	    var drag = d3.drag()
		    .on("start", dragstarted)
		    .on("drag", dragged)
		    .on("end", dragended);
	    function dragstarted(d) {
			d3.select(this).raise().classed("active", true);
		}

		function dragged(d) {
			d3.select(this).attr("x", d.x = d3.event.x).attr("y", d.y = d3.event.y);
		}

		function dragended(d) {
			d3.select(this).attr("x", d.x = ((Math.floor(d3.event.x / 10)) * 10) + 5).attr("y", d.y = ((Math.floor(d3.event.y / 10)) * 10) + 5);
			Math.floor
			d3.select(this).classed("active", false);
		}   

		var gpoint = svg.append("g");
		gpoint.selectAll("image")
		    .data($scope.pointData)
		  .enter().append("image")
		  	.attr('class','point')
		  	.attr('pid',d=> d.id)
		  	.attr('pos',d=> d.pos)
		  	.attr("xlink:href", d=> "./img/point-"+d.status+".png")
		    .attr("x", d=> d.x)
			.attr("y", d=> d.y)
			.attr("width", girdSize * 2)
			.attr("height", girdSize * 2)
			.call(drag)
			.on("click", function(d){
				$('#point').html('Point: ' + d.pos);
			});
		// gpoint.selectAll("circle")
		//     .data(pointData)
		//   .enter().append("circle")
		// 	.attr("cx", d=> d.x)
		// 	.attr("cy", d=> d.y)
		// 	.attr("r", girdSize)
		// 	.attr("fill", "#53FB67")
		// 	.attr('stroke', '#F4FA18')
		// 	.attr('stroke-width', '1.8')
		// 	.call(drag);



		

	    gpoint.selectAll("circle")
		    .on("click", function(d) {
	            console.log(d);
		    });

		$scope.carCtrl.init(cars);

		// $scope.carCtrl.createOne({id: 5, pos: '45,53', x: 45, y: 53, z: 90 });
		// $scope.carCtrl.createOne({id: 6, pos: '45,48', x: 45, y: 49, z: 90 });

		// setTimeout(function(){
		// 	$scope.carCtrl.move({id: 6, pos: { x: 53, y: 49, z: 90 }, pallet: { f: false, b: false } });
		// },2000);
		// setTimeout(function(){
		// 	$scope.carCtrl.move({id: 6, pos: { x: 62, y: 49, z: 90 } });
		// },4000);
		// setTimeout(function(){
		// 	$scope.carCtrl.move({id: 6, pos: { x: 62, y: 49, z: 180 } });
		// },6000);
		// setTimeout(function(){
		// 	$scope.carCtrl.move({id: 6, pos: { x: 62, y: 53, z: 180 } });
		// },8000);
		// setTimeout(function(){
		// 	$scope.carCtrl.move({id: 6, pos: { x: 62, y: 74, z: 180 } });
		// },10000);

		function zoomed() { 
			console.log(d3.event.transform);
			pan = d3.event.transform;
			gline.attr("transform", d3.event.transform);
			gbox.attr("transform", d3.event.transform);
			gpoint.attr("transform", d3.event.transform);
			gshadow.attr("transform", d3.event.transform);
			gcctv.attr("transform", d3.event.transform);
			$scope.carCtrl.gcar.attr("transform", d3.event.transform);
		}

		svg.on('mousemove', function () { 
			mouse.x = Math.floor((d3.mouse(this)[0] - pan.x) / 10);
			mouse.y = Math.floor((d3.mouse(this)[1] - pan.y) / 10);    
			$('#mousePosition').html(mouse.x+','+mouse.y);        
		});
	}
	
	console.log(calc.roundCompass15(356));
	$scope.init();

	$scope.socket = io.connect('/', {query: 'room=maps'});
	if($scope.socket){
        $scope.socket.on('conn', function (msg) {
            console.log("connect " + msg);
        });
        $scope.socket.on('move', function (d) {
			var k = 7;
			$scope.carCtrl.move({id: d.number, pos: { x: d.pos.x, y: d.pos.y, z: d.pos.z }, pallet: { f: d.pallet.f, b: d.pallet.b } });
     //    	d3.select('image.car')
					// .attr("x", (d.pos.x * girdSize) - ((k/2) * girdSize) + k - 2)
					// .attr("y", (d.pos.y * girdSize) - ((k/2) * girdSize) + k - 2)
					// .attr("xlink:href", "./img/car/" + pad(d.pos.z,3) +d.pallet.f+''+d.pallet.b+".png");
        });
    }


	// var de1 = 33;
 //    $scope.socket2 = io.connect('http://192.168.101.154:3001/');
	// if($scope.socket2){
	// 	$scope.socket2.on('allupdate', function (msg) {

	// 		let n = convertCompass(msg[0][1]);
 //        	// $('#gc').html(msg[0][1]);
 //        	if(n != de1 && n != undefined){
	//             console.log("Deg: " + n, de1);
	//         	de1 = n;
	//         	// $scope.carCtrl.rotate(0, de1);

	//         	d3.select('image.car[cid="0"]')
	// 				.attr("xlink:href", "./img/car/" + pad(de1,3) + "00.png");
	//         }
 //        });
	// }
});