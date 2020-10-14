var WIDTH = 8;
var HEIGHT = 8;

var nUnchekedBoxes = 0;

var MINES = 10;
var totalNMines = 0;
var flaggedMines = 0;
var nFlags = 0;

var play = false;
var win = false;
var lose = false;

var graphics = {
  undiscovered: {x: 0,y: -16},
  discovered: {x: -16,y: -16},
  nMine: [
    {x: 0,y: 0}, 
    {x: -16,y: 0}, 
    {x: -32,y: 0},
    {x: -48,y: 0},
    {x: -64,y: 0},
    {x: -80,y: 0},
    {x: -96,y: 0},
    {x: -112,y: 0},
    {x: -128,y: 0},
  ],
  flag: {x: -48,y: -16},
  wrn_flag: {x: -64,y: -16},
  mine_lc: {x: -32,y: -16},
  mine_ex: {x: -80,y: -16},
  quest_1: {x: -96,y: -16}, //unused
  quest_2: {x: -112,y: -16}, //unused
  digit: [
    {x: 0,y: -33},
    {x: -12,y: -33},
    {x: -24,y: -33},
    {x: -36,y: -33},
    {x: -48,y: -33},
    {x: -60,y: -33},
    {x: -72,y: -33},
    {x: -84,y: -33},
    {x: -96,y: -33},
    {x: -108,y: -33},
    {x: -120,y: -33},
  ],
  face: {
    normal: {x: 0,y: -55},
    quessing: {x: -27,y: -55},
    dead: {x: -54,y: -55},
    win: {x: -81,y: -55},
    pressed: {x: -108,y: -55},
  }
}

const PX_WIDTH_BOX = 16;
const PX_HEIGHT_BOX = 16;

var minefield = null;

var indicators = {
  timer: {
    digit: [
      document.querySelector('#timer > .digit1'),
      document.querySelector('#timer > .digit2'),
      document.querySelector('#timer > .digit3')
    ],
    HTMLObj: document.getElementById('timer')
  },
  face: {
    HTMLObj: document.getElementById('face')
  },
  minecounter: {
    digit: [
      document.querySelector('#minecounter > .digit1'),
      document.querySelector('#minecounter > .digit2'),
      document.querySelector('#minecounter > .digit3')
    ],
    HTMLObj: document.getElementById('minecounter')
  },
}

var form = {
  radio: {
    beginner: document.getElementById('Preset1'),
    intermediate: document.getElementById('Preset2'),
    expert: document.getElementById('Preset3'),
    custom: document.getElementById('Custom'),
  },
  number: {
    width: document.getElementById('customWidth'),
    height: document.getElementById('customHeight'),
    nMines: document.getElementById('customNMines'),
  }
}

indicators.face.HTMLObj.addEventListener("mousedown", function(e) {
  facePressed()
});
indicators.face.HTMLObj.addEventListener("mouseout", function(e) {
  restoreFace()
});
indicators.face.HTMLObj.addEventListener("mouseup", function(e) {
  newGame();
  restoreFace()
});

var pressedFace = false;

var timeIntervalID = 0;
var timerRunning = false;

var timeStar = null;
var totalTime = null;
var lastSecond = null;

function checkForm(preset) {
  switch (preset) {
    case 'Beginner':
      WIDTH = 8;
      form.number.width.value = 8;
      form.number.width.disabled = true;
      HEIGHT = 8;
      form.number.height.value = 8;
      form.number.height.disabled = true;
      MINES = 10;
      form.number.nMines.value = 10;
      form.number.nMines.disabled = true;
      break;
    case 'Intermediate':
      WIDTH = 16;
      form.number.width.value = 16;
      form.number.width.disabled = true;
      HEIGHT = 16;
      form.number.height.value = 16;
      form.number.height.disabled = true;
      MINES = 40;
      form.number.nMines.value = 40;
      form.number.nMines.disabled = true;
      break;
    case 'Expert':
      WIDTH = 32;
      form.number.width.value = 32;
      form.number.width.disabled = true;
      HEIGHT = 16;
      form.number.height.value = 16;
      form.number.height.disabled = true;
      MINES = 104;
      form.number.nMines.value = 104;
      form.number.nMines.disabled = true;
      break;
    case 'Custom':
      WIDTH = 8;
      form.number.width.value = 8;
      form.number.width.disabled = false;
      HEIGHT = 8;
      form.number.height.value = 8;
      form.number.height.disabled = false;
      MINES = 10;
      form.number.nMines.value = 10;
      form.number.nMines.disabled = false;
      break;
  }
}

function customForm() {
  WIDTH = form.number.width.value;
  HEIGHT = form.number.height.value;
  if (form.number.nMines.value > (WIDTH * HEIGHT - 1))
    form.number.nMines.value = (WIDTH * HEIGHT - 1)
  MINES = form.number.nMines.value;
}

function newGame() {
  console.log('W:' + WIDTH + '  H:' + HEIGHT + '  M:' + MINES);

  minefield = null;
  document.getElementById('minefield').innerHTML = null;

  minefield = new Array(WIDTH);
  for (var i = 0; i < WIDTH; i++)
    minefield[i] = new Array(HEIGHT);

  for (var i = 0; i < WIDTH; i++)
    for (var j = 0; j < HEIGHT; j++)
      minefield[i][j] = {
        mine: false,
        nMines: 0,
        flaged: false,
        showed: false,
        HTMLObj: null
      };

  for (var j = 0; j < HEIGHT; j++)
    for (var i = 0; i < WIDTH; i++)
      document.getElementById('minefield').innerHTML += '<div class="box" id="box' + i + '-' + j + '" onclick="check(' + i + ',' + j + ')" oncontextmenu="flag(' + i + ',' + j + ')"></div>';
      //document.getElementById('"box' + i + '-' + j + '"').addEventListener("click",()=>{check(i,j)});

  document.getElementById('minefield').style.width = (PX_WIDTH_BOX * WIDTH) + 'px';
  document.getElementById('minefield').style.height = (PX_HEIGHT_BOX * HEIGHT) + 'px';

  document.getElementById('header').style.width = (PX_WIDTH_BOX * WIDTH) + 'px';

  document.getElementById('minesweeper').style.width = ((PX_WIDTH_BOX * WIDTH) + 32) + 'px';
  document.getElementById('minesweeper').style.height = ((PX_HEIGHT_BOX * HEIGHT) + 149) + 'px';

  document.getElementById('face').style.transform = 'translateX(' + (((PX_WIDTH_BOX * WIDTH) - 116) / 2) + 'px)';

  for (var i = 0; i < WIDTH; i++)
    for (var j = 0; j < HEIGHT; j++)
      minefield[i][j].HTMLObj = document.getElementById('box' + i + '-' + j);

  nUnchekedBoxes = WIDTH * HEIGHT;
  totalNMines = MINES;
  flaggedMines = 0;
  nFlags = 0;

  fillField(totalNMines);

  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      var nMines = 0;
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          nMines += ((!(i + x < 0 || j + y < 0) &&
            !(i + x >= WIDTH || j + y >= HEIGHT) &&
            minefield[x + i][y + j].mine
          ) ? 1 : 0);
        }
      }
      minefield[x][y].nMines = nMines;
    }
  }
  play = true;
  win = false;
  lose = false;

  setCounter(indicators.minecounter, totalNMines);

  clearInterval(timeIntervalID)
  timeIntervalID = setInterval(timer, 250);
  timerRunning = true;

  timeStar = (new Date()).getTime();
}

function fillField(nMines) {
  var placedMines = 0;
  while (placedMines < nMines) {
    var x = Math.floor(Math.random() * WIDTH)
    var y = Math.floor(Math.random() * HEIGHT)
    if (!minefield[x][y].mine) {
      minefield[x][y].mine = true;
      placedMines++;
    }
  }
}

function check(x, y) {
  console.log('(' + x + ',' + y + ')');
  if (play && !minefield[x][y].showed && !minefield[x][y].flaged) {
    if (minefield[x][y].mine) {
      loseGame();
      minefield[x][y].HTMLObj.style.backgroundPosition = graphics.mine_ex.x + 'px ' + graphics.mine_ex.y + 'px';
      minefield[x][y].showed = true;
    } else {
      minefield[x][y].HTMLObj.style.backgroundPosition = graphics.nMine[minefield[x][y].nMines].x + 'px ' + graphics.nMine[minefield[x][y].nMines].y + 'px';
      minefield[x][y].showed = true;
      nUnchekedBoxes--;
      if (minefield[x][y].nMines == 0) {
        for (var i = -1; i <= 1; i++)
          for (var j = -1; j <= 1; j++)
            if (!(i + x < 0 || j + y < 0) && !(i + x >= WIDTH || j + y >= HEIGHT))
              if (!minefield[i + x][j + y].showed)
                check(i + x, j + y);
      }
      if (nUnchekedBoxes == totalNMines) winGame();
    }
  }
}

function flag(x, y) {
  if (play) {
    if (!minefield[x][y].showed) {
      minefield[x][y].flaged = !minefield[x][y].flaged;
      if (minefield[x][y].flaged) {
        if (minefield[x][y].mine) flaggedMines++;
        minefield[x][y].HTMLObj.style.backgroundPosition = graphics.flag.x + 'px ' + graphics.flag.y + 'px';
        nFlags++;
      } else {
        if (minefield[x][y].mine) flaggedMines--;
        minefield[x][y].HTMLObj.style.backgroundPosition = graphics.undiscovered.x + 'px ' + graphics.undiscovered.y + 'px';
        nFlags--;
      }
      if (flaggedMines == totalNMines && nFlags == totalNMines) winGame();
    }
    setCounter(indicators.minecounter, totalNMines - nFlags);
  }
}

function loseGame() {
  totalTime = (new Date()).getTime() - timeStar;

  for (var x = 0; x < WIDTH; x++)
    for (var y = 0; y < HEIGHT; y++)
      if (minefield[x][y].mine && minefield[x][y].flaged) {
        //Do nothing
      } else if (minefield[x][y].mine) {
    minefield[x][y].HTMLObj.style.backgroundPosition = graphics.mine_lc.x + 'px ' + graphics.mine_lc.y + 'px';
  } else if (minefield[x][y].flaged) {
    minefield[x][y].HTMLObj.style.backgroundPosition = graphics.wrn_flag.x + 'px ' + graphics.wrn_flag.y + 'px';
  }

  play = false;
  lose = true;

  clearInterval(timeIntervalID);
  timerRunning = false;
  indicators.face.HTMLObj.style.backgroundPosition = graphics.face.dead.x + 'px ' + graphics.face.dead.y + 'px';
}

function winGame() {
  totalTime = (new Date()).getTime() - timeStar;

  for (var x = 0; x < WIDTH; x++)
    for (var y = 0; y < HEIGHT; y++)
      if (minefield[x][y].mine && !minefield[x][y].flaged) {
        flaggedMines++;
        minefield[x][y].HTMLObj.style.backgroundPosition = graphics.flag.x + 'px ' + graphics.flag.y + 'px';
        nFlags++;
      }

  setCounter(indicators.minecounter, 0);

  play = false;
  win = true;

  clearInterval(timeIntervalID);
  timerRunning = false;

  indicators.face.HTMLObj.style.backgroundPosition = graphics.face.win.x + 'px ' + graphics.face.win.y + 'px';

  var winDate = new Date(totalTime);
  var winMSN = 'Time: ';
  if (winDate.getHours() > 0) winMSN += winDate.getHours() + 'h ';
  if (winDate.getMinutes() > 0) winMSN += winDate.getMinutes() + 'm ';
  if (winDate.getSeconds() > 0) winMSN += winDate.getSeconds() + 's ';
  if (winDate.getMilliseconds() > 0) winMSN += winDate.getMilliseconds() + 'ms';

  alert(winMSN);
}

function facePressed() {
  indicators.face.HTMLObj.style.backgroundPosition = graphics.face.pressed.x + 'px ' + graphics.face.pressed.y + 'px';
  pressedFace = true;
}

function restoreFace() {
  if (pressedFace) {
    if (win) indicators.face.HTMLObj.style.backgroundPosition = graphics.face.win.x + 'px ' + graphics.face.win.y + 'px';
    else if (lose) indicators.face.HTMLObj.style.backgroundPosition = graphics.face.dead.x + 'px ' + graphics.face.dead.y + 'px';
    else indicators.face.HTMLObj.style.backgroundPosition = graphics.face.normal.x + 'px ' + graphics.face.normal.y + 'px';
    pressedFace = false;
  }
}

function timer() {
  var currTime = (new Date()).getTime() / 1000 | 0;

  if (lastSecond != currTime) {
    lastSecond = currTime;
    currTime = currTime - ((timeStar / 1000) | 0);
    if (currTime > 999)
      setCounter(indicators.timer, 999);
    else
      setCounter(indicators.timer, currTime);
  }

}

function setCounter(obj, num) {
  obj.digit[0].style.backgroundPosition = graphics.digit[getDigit(num, 3)].x + 'px ' + graphics.digit[getDigit(num, 3)].y + 'px';
  obj.digit[1].style.backgroundPosition = graphics.digit[getDigit(num, 2)].x + 'px ' + graphics.digit[getDigit(num, 2)].y + 'px';
  obj.digit[2].style.backgroundPosition = graphics.digit[getDigit(num, 1)].x + 'px ' + graphics.digit[getDigit(num, 1)].y + 'px';

  if (num < 0)
    obj.digit[0].style.backgroundPosition = graphics.digit[10].x + 'px ' + graphics.digit[10].y + 'px';
}

function getDigit(num, digit) {
  return (Math.abs(num) - ((Math.abs(num) / Math.pow(10, digit)) | 0) * Math.pow(10, digit)) / Math.pow(10, digit - 1) | 0;
}

document.getElementById("Preset1").addEventListener("click",() => {checkForm('Beginner');})
document.getElementById("Preset2").addEventListener("click",() => {checkForm('Intermediate');})
document.getElementById("Preset3").addEventListener("click",() => {checkForm('Expert');})
document.getElementById("Custom").addEventListener("click",() => {checkForm('Custom');})

document.getElementById("customWidth").addEventListener("click",() => {customForm();})
document.getElementById("customWidth").addEventListener("keypress",() => {customForm();})
document.getElementById("customHeight").addEventListener("click",() => {customForm();})
document.getElementById("customHeight").addEventListener("keypress",() => {customForm();})
document.getElementById("customNMines").addEventListener("click",() => {customForm();})
document.getElementById("customNMines").addEventListener("keypress",() => {customForm();})

document.getElementById("play").addEventListener("keypress",() => {
    setTimeout(function(){ newGame(); }, 10);
    return false;
})
