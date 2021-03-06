$(function(){
	let timeout = 0;
	let hostname = window.location.hostname;
	let pathname = window.location.pathname;
	let ip = '';
	$.get( "http://192.168.1.7:3311/getip", function( data ) {
		ip = data.replace('::ffff:','');
		console.log(ip);

		setInterval(()=>{ 
			timeout++; 
			console.log(timeout);
			if(timeout < 12){
				console.log('update');
				$.ajax({
	                type: "POST",
	                url: "http://192.168.1.7:3311/upsert",
	                data:  JSON.stringify({ 
						db: 'portal',
						coll: 'howlong',
						query: { host: hostname, path: pathname, client: ip },
						data: { $inc: { time: 5 } } 
					}),
					dataType: "json",
	                success: function (response) {
	                },
	                error: function (xhr) {
	                }
	            });
			}
		}, 5000);
	});	

	$(document)
		.on('mousemove', ()=>{ timeout = 0; console.log('mousemove'); })
		.on('keypress', ()=>{ timeout = 0; console.log('keypress'); });
}());