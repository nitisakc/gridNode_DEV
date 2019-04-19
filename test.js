var blessed = require('blessed')
     , contrib = require('blessed-contrib');

var screen = blessed.screen()
var lcd = contrib.lcd({
  label: 'Test',
  elements: 4
});

screen.append(lcd);

setInterval(function(){
  var colors = ['green','magenta','cyan','red','blue'];
  var text = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  var value = Math.round(Math.random() * 1000);
  lcd.setDisplay(value + text[value%12]);
  lcd.setOptions({
    color: colors[value%5],
    elementPadding: 5
  });
  screen.render();
}, 1000);

screen.key(['g'], function(ch, key) {
  lcd.increaseWidth();
  screen.render();
});
screen.key(['h'], function(ch, key) {
  lcd.decreaseWidth();
  screen.render();
});
screen.key(['t'], function(ch, key) {
  lcd.increaseInterval();
  screen.render();
});
screen.key(['y'], function(ch, key) {
  lcd.decreaseInterval();
  screen.render();
});
screen.key(['b'], function(ch, key) {
  lcd.increaseStroke();
  screen.render();
});
screen.key(['n'], function(ch, key) {
  lcd.decreaseStroke();
  screen.render();
});

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.render()
