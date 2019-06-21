let app = angular.module('APP', []);
app.controller('mainCtrl', function($scope, $http) {
	let svg = d3.select("svg"),
		gridSize = 10;

	let grpl = svg.append("g").attr('class','rpl');
	let gyelarea = svg.append("g").attr('class','yelarea');
	let gredarea = svg.append("g").attr('class','redarea');
	let gline = svg.append("g").attr('class','grid');
	let gobj = svg.append("g").attr('class','obj');

	$scope.socketInit = ()=>{
		$scope.socket = io.connect('/');
		if($scope.socket){
	        $scope.socket.on('conn', function (msg) {
	            console.log("Socket connect " + msg);
	        });

	        $scope.socket.on('safety', function (d) {
	        	$scope.$apply(function(){ $scope.safety = d; });
	        	grpl.selectAll("circle").remove();
	        	grpl.append("circle")
				    .attr("r", 2)
				    .attr("cx", d.rplr[0])
				    .attr("cy", d.rplr[1]);

				grpl.append("circle")
				    .attr("r", 2)
				    .attr("cx", d.rpll[0])
				    .attr("cy", d.rpll[1]);

				gyelarea.selectAll("polygon").remove();
				gyelarea.selectAll("polygon")
				    	.data([d.yelArea])
				    .enter().append("polygon")
						.attr("fill-opacity","1")
				    	.attr("fill", '#e8f000')
						.attr('stroke', '#e8f000')
						.attr('stroke-width', '0')
				    	.attr("points", d=> d);

				gredarea.selectAll("polygon").remove();
				gredarea.selectAll("polygon")
				    	.data([d.redArea])
				    .enter().append("polygon")
						.attr("fill-opacity","1")
				    	.attr("fill", '#f19901')
						.attr('stroke', '#f19901')
						.attr('stroke-width', '0')
				    	.attr("points", d=> d);

				gobj.selectAll("circle").remove();
				gobj.selectAll("circle")
				    	.data(d.points)
					.enter().append("circle")
					    .attr("r", 1)
					    .attr("fill", c=> c[3] ? '#f20202' : (c[2] ? '#f19901' : '#0c9302'))
					    .attr("cx", c=> c[0])
					    .attr("cy", c=> c[1]);
	        });
	    }
	}

	$scope.socketInit();
});