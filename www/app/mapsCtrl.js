let app = angular.module('APP', []);
app.controller('mainCtrl', function($scope, $http) {
	$scope.alert = false;
	let svg = d3.select("svg"),
		gridSize = 10;

	let gyelarea = svg.append("g").attr('class','yelarea');
	let gredarea = svg.append("g").attr('class','redarea');
	let gline = svg.append("g").attr('class','grid');
	let obj = svg.append("g").attr('class','obj');

	let startx = 200, 
		starty = 200,
		height = 50,
		width = 120,
		angle = -0,
		warning = 140
		offset = 90,
		varea = 5,
		center = width / 2,
		padding = (width - offset) / 2,
		rplr = [startx+padding, starty],
		rpll = [startx+padding+offset, starty];

	svg.append("circle")
	    .attr("r", 2)
	    .attr("cx", rplr[0])
	    .attr("cy", rplr[1]);

	svg.append("circle")
	    .attr("r", 2)
	    .attr("cx", rpll[0])
	    .attr("cy", rpll[1]);

	let yelArea = [
		[startx - padding, starty],
		[startx + angle - padding, starty - warning],
		[startx + width + angle + padding, starty - warning],
		[startx + width + padding, starty],
		[startx + center, starty - varea]
	];    
	let redArea = [
		[startx, starty],
		[startx + angle, starty - height],
		[startx + width + angle, starty - height],
		[startx + width, starty],
		[startx + center, starty - varea]
	];

	gyelarea.selectAll("polygon").remove();
	gyelarea.selectAll("polygon")
	    	.data([yelArea])
	    .enter().append("polygon")
			.attr("fill-opacity","1")
	    	.attr("fill", '#e8f000')
			.attr('stroke', '#e8f000')
			.attr('stroke-width', '0')
	    	.attr("points", d=> d);

	gredarea.selectAll("polygon").remove();
	gredarea.selectAll("polygon")
	    	.data([redArea])
	    .enter().append("polygon")
			.attr("fill-opacity","1")
	    	.attr("fill", '#f19901')
			.attr('stroke', '#f19901')
			.attr('stroke-width', '0')
	    	.attr("points", d=> d);

	let isMarkerInsidePolygon = (point, vs)=>{
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

	let addPoint = (raw, off = 0)=>{
		let y = starty + parseInt(raw[1] * Math.sin((raw[0]- 90) * Math.PI / 180));
		let x = startx + parseInt(raw[1] * Math.cos((raw[0]- 90) * Math.PI / 180));
		let red = false;
		x = x + padding + off;
		let len = Math.sqrt(Math.pow(x - rpll[0], 2) + Math.pow(y - rpll[1], 2));
		if(len <= 200){
			// if(x >= (startx-center) &&  x <= (startx+width+center) && y <= starty && y >= (starty-height) ){
				red = isMarkerInsidePolygon([x, y], redArea);
			// }
    		obj.append("circle")
			    .attr("r", 1)
			    .attr("fill", red ? '#f20202' : '#0c9302')
			    .attr("cx", x)
			    .attr("cy", y);
		}

		return [x, y, red];
	}

	$scope.socketInit = ()=>{
		$scope.socket = io.connect('/');
		if($scope.socket){
	        $scope.socket.on('conn', function (msg) {
	            console.log("Socket connect " + msg);
	        });

	        $scope.socket.on('safety', function (d) {
	        	$scope.$apply(function(){ $scope.safety = d; });
	        	let count = 0;

	        	obj.selectAll("circle").remove();
	        	let grids = [], points = [];
	        	for(i = 0; i < $scope.safety.l.length; i++){
					let point = addPoint($scope.safety.l[i], 0);
					if(point[2]){ count++; }
	        	}
	        	let rpoints = [];
	        	for(i = 0; i < $scope.safety.r.length; i++){
					let point = addPoint($scope.safety.r[i], offset);
					if(point[2]){ count++; }
	        	}
	        	$scope.alert = count == 0 ? false : true;
	        });
	    }
	}

	$scope.socketInit();
});