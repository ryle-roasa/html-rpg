"use strict";

const ctx = document.getElementById("ctx").getContext("2d");
ctx.fillStyle = "white";
ctx.font = "15px Arial";
const canvasWidth = 500;
const canvasHeight = 500;

let timeStarted = Date.now();
let frameCount = 0;
let score = 0;

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "w":
      player.pressingUp = true;
      break;
    case "a":
      player.pressingLeft = true;
      break;
    case "s":
      player.pressingDown = true;
      break;
    case "d":
      player.pressingRight = true;
      break;
    default:
      break;
  }
});
document.addEventListener("keyup", function (event) {
  switch (event.key) {
    case "w":
      player.pressingUp = false;
      break;
    case "a":
      player.pressingLeft = false;
      break;
    case "s":
      player.pressingDown = false;
      break;
    case "d":
      player.pressingRight = false;
      break;
    default:
      break;
  }
});

function startGame() {
  frameCount++;
  score++;

  if (frameCount % 100 === 0) enemyCreator();
  if (frameCount % 200 === 0) upgradeCreator();

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  currentMap.draw();
  // player
  player.updatePlayer();
  ctx.fillText(`HP: ${player.hp}`, 0, 20);
  ctx.fillText(`Score: ${score}`, 0, 40);

  //enemies
  for (let id in enemyList) {
    enemyList[id].updateEnemy();
  }
  // upgrade
  for (let id in upgradeList) {
    upgradeList[id].updateUpgrade();
  }
  // bullets
  for (let id in bulletList) {
    bulletList[id].updateBullet();
  }
}

class Maps {
  constructor(id, imgSrc, width, height) {
    this.id = id;
    this.image = new Image();
    this.width = width;
    this.height = height;
    this.image.src = imgSrc;
  }

  draw() {
    let x = canvasWidth / 2 - player.x;
    let y = canvasHeight / 2 - player.y;

    ctx.drawImage(
      this.image,
      0,
      0,
      this.image.width,
      this.image.height,
      x,
      y,
      this.image.width * 2,
      this.image.height * 2
    );
  }
}

let currentMap = new Maps("field", "images\\sampleMap.png", 1280, 960);

function newGame() {
  player.hp = 30;
  player.atkSpd = 1;
  enemyList = {};
  bulletList = {};
  upgradeList = {};
  frameCount = 0;
  score = 0;
  timeStarted = Date.now();
  enemyCreator();
  enemyCreator();
  enemyCreator();
}

// Starting game

newGame();
setInterval(startGame, 40);
