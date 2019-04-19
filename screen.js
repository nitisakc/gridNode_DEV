let blessed = require('blessed')
     , contrib = require('blessed-contrib');
const calc = require('./utils/calc');

let screen = blessed.screen();

let grid = new contrib.grid({rows: 12, cols: 19, screen: screen});

// table status
  let table =  grid.set(0, 0, 5, 3, contrib.table, { 
    keys: false,
    fg: 'white',
    label: 'Arduino val.',
    interactive: false,
    columnSpacing: 1,
    columnWidth: [15, 10]
  });
  let varName = ['dir', 'spd', 'currDeg', 'selDeg', 'diffDeg', 'pidon', 'pidval', 'liftpos', 'liftup', 'safety', 'pallet'];
  function generateTable() {
     let data = [];
     for (let i = 0; i < varName.length; i++) {
       let row = [];      
       row.push(varName[i]);
       row.push(global.var[varName[i]]);

       data.push(row);
     }

     table.setData({ headers: ['Names', 'Values'], data: data });

     screen.render();
  }
  generateTable();
  setInterval(generateTable, 100);

//table ar
  let tableAr =  grid.set(0, 3, 5, 6, contrib.table, { 
    keys: false,
    fg: 'white',
    label: 'AR Vision',
    interactive: false,
    columnSpacing: 1,
    columnWidth: [8, 8, 8, 8, 8, 8]
  });
  function generateTableAr() {
     let data = [];
     tableAr.setData({ headers: ['ID', 'Len', 'Deg', 'XL', 'YL', 'Err'], data: [[0, 0, 0, 0, 0, 0]] });
     screen.render();
  }
  generateTableAr();
  setInterval(generateTableAr, 100);

//network status
  var netstat = grid.set(5, 0, 4, 4, contrib.donut, { 
    label: 'Network Status',
    radius: 12,
    arcWidth: 6,
    remainColor: 'red',
    yPadding: 0,
    spacing: 0,
    data: [ 
      { label: 'WIFI', color: 'yellow'},
      { label: 'TCS', color: 'yellow'} 
    ]
  });
  setInterval(()=>{
    if(global.syss.wifi != null){
      netstat.setData([ 
        { percent: global.syss.wifi, label: 'WIFI', color: 'green'},
        { percent: global.syss.tcs, label: 'TCS', color: 'green'} 
      ]);
    }
  }, 2000);

//lcd ger diff
  var lcdDiff = grid.set(9, 0, 2, 4, contrib.lcd, { 
    segmentWidth: 0.04,
    segmentInterval: 0.01,
    strokeWidth: 0.04,
    elements: 4,
    elementSpacing: 4,
    elementPadding: 2,
    color: 'green',
    label: 'Degree Diff'
  });

  setInterval(()=>{
    lcdDiff.setDisplay(calc.pad(global.var.diffDeg, 4, " "));
  }, 200);

screen.render();

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.on('resize', function() {
  grid.emit('attach');
  box.emit('attach');
});