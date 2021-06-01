"use strict";

// Lists
let enemyList = {};
let upgradeList = {};
let bulletList = {};
let imageList = {};

imageList.player = new Image();
imageList.player.src = "images\\mainCharacter_front.png";
imageList.enemy = new Image();
imageList.enemy.src = "images\\enemySkel_front.png";
imageList.bullet = new Image();
imageList.bullet.src = "images\\bulletCharacter.png";
imageList.upgrade1 = new Image();
imageList.upgrade1.src = "images\\upgrade1.png";
imageList.upgrade2 = new Image();
imageList.upgrade2.src = "images\\upgrade2.png";
imageList.upgrade3 = new Image();
imageList.upgrade3.src = "images\\upgrade3.png";
imageList.map = new Image();
imageList.map.src = "images\\sampleMap.png";

class Entity {
  constructor(id, x, spdX, y, spdY, width, height, img, type) {
    this.id = id;
    this.x = x;
    this.spdX = spdX;
    this.y = y;
    this.spdY = spdY;
    this.width = width;
    this.height = height;
    this.img = img;
    this.type = type;
  }

  draw() {
    ctx.save();
    // let x = this.x - this.width / 2;
    // let y = this.y - this.height / 2;

    let x = this.x - player.x;
    let y = this.y - player.y;

    x += canvasWidth / 2;
    y += canvasHeight / 2;
    x -= this.width / 2;
    y -= this.height / 2;

    ctx.drawImage(
      this.img,
      0,
      0,
      this.img.width,
      this.img.height,
      x,
      y,
      this.width,
      this.height
    );
    ctx.restore();
  }

  position() {
    if (this.type === "player") {
      if (this.pressingUp) this.y -= 4;
      if (this.pressingDown) this.y += 4;
      if (this.pressingLeft) this.x -= 4;
      if (this.pressingRight) this.x += 4;
      //preventing out of bounds
      if (this.x < this.width / 2) this.x = this.width / 2;
      if (this.x > currentMap.width - this.width / 2)
        this.x = currentMap.width - this.width / 2;
      if (this.y < this.height / 2) this.y = this.height / 2;
      if (this.y > currentMap.height - this.height / 2)
        this.y = currentMap.height - this.height / 2;
    } else {
      this.x += this.spdX;
      this.y += this.spdY;
      if (this.x <= 0 || this.x >= currentMap.width) {
        this.spdX = -this.spdX;
      }
      if (this.y <= 0 || this.y >= currentMap.height) {
        this.spdY = -this.spdY;
      }
    }
  }

  distanceCalculator(entity2) {
    let vx = this.x - entity2.x;
    let vy = this.y - entity2.y;
    return (vx ** 2 + vy ** 2) ** 0.5;
  }

  rectangleCollisionTester(rect1, rect2) {
    return (
      rect1.x <= rect2.x + rect2.width &&
      rect2.x <= rect1.x + rect1.width &&
      rect1.y <= rect2.y + rect2.height &&
      rect2.y <= rect1.y + rect1.height
    );
  }

  collisionTester(entity2) {
    let rect1 = {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
    let rect2 = {
      x: entity2.x - entity2.width / 2,
      y: entity2.y - entity2.height / 2,
      width: entity2.width,
      height: entity2.height,
    };
    return this.rectangleCollisionTester(rect1, rect2);
  }

  update() {
    this.draw();
    this.position();
  }
}

class Actor extends Entity {
  constructor(id, x, spdX, y, spdY, width, height, img, type) {
    super(id, x, spdX, y, spdY, width, height, img, type);
    this.hp = 10;
    this.atkSpd = 1;
    this.atkCounter = 0;
    this.aimAngle = 0;
  }

  performAttack() {
    if (this.atkCounter > 25) {
      this.atkCounter = 0;
      bulletCreator(this);
    }
  }

  performSpAttack() {
    if (this.atkCounter > 50) {
      bulletCreator(this, this.aimAngle - 5);
      bulletCreator(this, this.aimAngle);
      bulletCreator(this, this.aimAngle + 5);
      this.atkCounter = 0;
    }
  }

  updateActor() {
    this.update();
    this.atkCounter += this.atkSpd;
  }
}

class Player extends Actor {
  constructor(id, x, spdX, y, spdY, width, height, img, type) {
    super(id, x, spdX, y, spdY, width, height, img, type);
    this.pressingDown = false;
    this.pressingUp = false;
    this.pressingLeft = false;
    this.pressingRight = false;
  }

  updatePlayer() {
    this.updateActor();
    // If the player dies
    if (this.hp <= 0) {
      let timeSurvived = Date.now() - timeStarted;
      console.log(`You LOST! You survived for ${timeSurvived / 1000} seconds.`);
      newGame();
    }
  }
}

class Enemy extends Actor {
  constructor(id, x, spdX, y, spdY, width, height, img, type) {
    super(id, x, spdX, y, spdY, width, height, img, type);
    enemyList[id] = this;
  }

  updateEnemy() {
    this.updateActor();
    this.performAttack();
  }
}

class Upgrade extends Entity {
  constructor(id, x, spdX, y, spY, width, height, img, category, type) {
    super(id, x, spdX, y, spY, width, height, img, type);
    this.category = category;
    upgradeList[id] = this;
  }

  updateUpgrade() {
    this.update();

    let isColliding = player.collisionTester(this);
    if (isColliding) {
      if (this.category === "score-low") score += 1000;
      if (this.category === "score-high") score += 10000;
      if (this.category === "atkSpd") player.atkSpd += 1.5;
      delete upgradeList[this.id];
    }
  }
}

class Bullet extends Entity {
  constructor(id, x, spdX, y, spY, width, height, img, type, combatType) {
    super(id, x, spdX, y, spY, width, height, img, type, combatType);
    this.timer = 0;
    this.combatType = combatType;
    bulletList[id] = this;
  }

  updateBullet() {
    this.update();
    this.timer++;
    let toRemove = false;
    if (this.timer > 75) {
      toRemove = true;
    }

    if (this.combatType === "player") {
      for (let id in enemyList) {
        let isColliding = this.collisionTester(enemyList[id]);
        if (isColliding) {
          score += 250;
          toRemove = true;
          delete enemyList[id];
        }
      }
    } else if (this.combatType === "enemy") {
      if (this.collisionTester(player)) {
        player.hp -= 1;
        toRemove = true;
      }
    }
    if (toRemove) delete bulletList[this.id];
  }
}

function enemyCreator() {
  let id = Math.random();
  let x = Math.random() * currentMap.width;
  let spdX = Math.random() * 5;
  let y = Math.random() * currentMap.height;
  let spdY = Math.random() * 5;
  let width = 45;
  let height = 65;
  let img = imageList.enemy;
  let type = "enemy";
  new Enemy(id, x, spdX, y, spdY, width, height, img, type);
}

function upgradeCreator() {
  let id = Math.random();
  let x = Math.random() * currentMap.width;
  let spdX = 0;
  let y = Math.random() * currentMap.height;
  let spdY = 0;
  let width = 15;
  let height = 25;
  let img;
  let category;
  if (Math.random() > 0.77) {
    category = "score-low";
    img = imageList.upgrade1;
  } else if (Math.random() > 0.55) {
    category = "score-high";
    img = imageList.upgrade2;
  } else {
    category = "atkSpd";
    img = imageList.upgrade3;
  }
  let type = "upgrade";
  new Upgrade(id, x, spdX, y, spdY, width, height, img, category, type);
}

function bulletCreator(entity, overwriteAngle) {
  let angle = entity.aimAngle;
  if (overwriteAngle !== undefined) angle = overwriteAngle; // overwrite angle
  let id = Math.random();
  let x = entity.x;
  let spdX = Math.cos((angle / 180) * Math.PI) * 10;
  let y = entity.y;
  let spdY = Math.sin((angle / 180) * Math.PI) * 10;
  let width = 20;
  let height = 20;
  let img = imageList.bullet;
  let type = "bullet";
  new Bullet(id, x, spdX, y, spdY, width, height, img, type, entity.type);
}

let player = new Player("P1", 0, 0, 480, 0, 40, 60, imageList.player, "player"); // CREATE PLAYER

// MOUSE FUNCTIONS

document.addEventListener("mousemove", function (mouse) {
  let mouseX =
    mouse.clientX - document.getElementById("ctx").getBoundingClientRect().left;
  let mouseY =
    mouse.clientY - document.getElementById("ctx").getBoundingClientRect().top;
  mouseX -= canvasWidth / 2;
  mouseY -= canvasHeight / 2;
  player.aimAngle = (Math.atan2(mouseY, mouseX) / Math.PI) * 180;
});

document.addEventListener("click", function () {
  player.performAttack();
});

document.addEventListener("contextmenu", function (event) {
  player.performSpAttack();
  event.preventDefault();
});
