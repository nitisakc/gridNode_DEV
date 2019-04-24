let app = require('./app');
const { other } = require('./arduino');

//require('./screen');

setTimeout(()=>{
	other.beep();
}, 3000);

// let varName = ['en','dirfw', 'currSpd', 'setSpd', 'currDeg', 'selDeg', 'diffDeg', 'pidon', 'pidval', 'liftpos', 'liftup', 'safety', 'pallet'];

//      for (let i = 0; i < varName.length; i++) {
//        console.log(global.var[varName[i]]);
//      }

// term.moveTo(10,10);
// term( 'Hello world!\n' );