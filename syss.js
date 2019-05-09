
const scanner = require('node-wifi-scanner');
const d3 = require("d3-scale");
const ping = require('ping');

let calcWifi = d3.scaleLinear().domain([-100, -20]).range([1, 100]).clamp(true);
let calcTcs = d3.scaleLinear().domain([0, 300]).range([100, 5]).clamp(true);

let scanwifi = ()=>{
	setTimeout(()=>{
		scanner.scan((err, networks) => {
			scanwifi();
			if (err) {
				return;
			}
			let n = networks.find(function(p) {
				return p.ssid == 'KIMPAI_RAMA3';
			});

			global.syss.wifi = (n == undefined ? 0 : (calcWifi(n.rssi)));
			// console.log(n);
			if(global.syss.wifi > 0){
				global.lamp.b.on();
				setTimeout(()=>{
					global.lamp.b.off();
					setTimeout(()=>{
						global.lamp.b.on();
						setTimeout(()=>{
							global.lamp.b.off();
						},100);
					},2000);
				},100);
			}
		});	
	}, 5000);
}
scanwifi();


let pingtcs = ()=>{
	setTimeout(()=>{
		ping.promise.probe('192.168.1.10', {
	        timeout: 10,
	        extra: ["-i 2"],
	    }).then(function (res) {
	        // console.log(res);
	        global.syss.tcs = res.avg == 'unknown' ? 0 : calcTcs(res.avg);
	    });
	}, 3000);
}
pingtcs();