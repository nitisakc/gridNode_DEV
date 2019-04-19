const scanner = require('node-wifi-scanner');
const d3 = require("d3-scale");

let calcWifi = d3.scaleLinear().domain([-100, -20]).range([1, 100]).clamp(true);

let scanwifi = ()=>{
	setTimeout(()=>{
		scanner.scan((err, networks) => {
			scanwifi();
			if (err) {
				// console.error(err);
				return;
			}
			let n = networks.find(function(p) {
				return p.ssid == 'KIMPAI_RAMA3';
			});

			global.syss.wifi = (n == undefined ? 0 : (calcWifi(n.rssi)));
			// console.log(n);
		});	
	}, 5000);
}
scanwifi();
