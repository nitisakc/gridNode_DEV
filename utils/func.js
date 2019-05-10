var func = {};


func.wait= (timeout, callblack)=>{
	setTimeout(()=>{
		callblack();
	},timeout);
}


module.exports = func;