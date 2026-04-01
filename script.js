const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const bgMusic = document.getElementById("bgMusic");
const playMusicBtn = document.getElementById("playMusicBtn");
const pauseMusicBtn = document.getElementById("pauseMusicBtn");
const restartBtn = document.getElementById("restartBtn");

const keys = {};
const images = {
  path: new Image(),
  intro: new Image(),
  city: new Image()
};

// Keep your original GitHub asset locations
images.path.src = "images/yellow-brick-road.webp";
images.intro.src = "images/wizard-of-oz.webp";
images.city.src = "images/emerald-castle.jpg";

// =======================
// CLASS
// =======================
class CanvasObject {
  constructor({
    x,
    y,
    width,
    height,
    color,
    speedX = 0,
    speedY = 0,
    pixelSize = 0,
    pixels = [],
    colors = {},
    message = "",
    kind = "rect",
    radius = 0,
    glowColor = "rgba(57, 255, 20, 0.35)"
  }) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.baseWidth = width;
    this.baseHeight = height;
    this.width = width;
    this.height = height;
    this.color = color;
    this.speedX = speedX;
    this.speedY = speedY;
    this.pixelSize = pixelSize;
    this.pixels = pixels;
    this.colors = colors;
    this.message = message;
    this.kind = kind;
    this.scale = 1;
    this.radius = radius || width / 2;
    this.baseRadius = this.radius;
    this.glowColor = glowColor;
  }

  updatePosition() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  clampToCanvas() {
    if (this.kind === "orb") {
      if (this.x < this.radius) this.x = this.radius;
      if (this.x > canvas.width - this.radius) this.x = canvas.width - this.radius;
      if (this.y < this.radius) this.y = this.radius;
      if (this.y > canvas.height - this.radius) this.y = canvas.height - this.radius;
      return;
    }

    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
  }

  bounceOnEdges() {
    if (this.kind === "orb") {
      if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
        this.speedX *= -1;
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
      }
      if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
        this.speedY *= -1;
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
      }
      return;
    }

    if (this.x <= 0 || this.x + this.width >= canvas.width) {
      this.speedX *= -1;
      this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    }
    if (this.y <= 0 || this.y + this.height >= canvas.height) {
      this.speedY *= -1;
      this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }
  }

  setScale(scale) {
    this.scale = scale;
    this.width = this.baseWidth * scale;
    this.height = this.baseHeight * scale;
    this.radius = this.baseRadius * scale;
  }

  resetPosition() {
    this.x = this.baseX;
    this.y = this.baseY;
  }

  draw() {
    if (this.kind === "pixel") {
      this.drawPixelSprite();
    } else if (this.kind === "orb") {
      drawOrb(this);
    } else if (this.kind === "monkey") {
      drawMonkey(this);
    } else {
      this.drawRect();
    }
  }

  drawRect() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  drawPixelSprite() {
    const drawSize = this.pixelSize * this.scale;
    for (let row = 0; row < this.pixels.length; row += 1) {
      for (let col = 0; col < this.pixels[row].length; col += 1) {
        const value = this.pixels[row][col];
        if (value !== ".") {
          ctx.fillStyle = this.colors[value] || "black";
          ctx.fillRect(
            this.x + col * drawSize,
            this.y + row * drawSize,
            drawSize,
            drawSize
          );
        }
      }
    }
  }

  drawSpeechBubble(width = 130) {
    if (!this.message) return;
    const bubbleY = this.y - 26;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(this.x - 4, bubbleY, width, 22);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(this.x - 4, bubbleY, width, 22);
    ctx.fillStyle = "#111";
    ctx.font = "11px Comic Sans MS";
    ctx.fillText(this.message, this.x + 2, bubbleY + 15);
  }
}

// =======================
// HELPERS
// =======================
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function hasCollided(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function circleRectCollision(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

function drawOrb(orb) {
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius + 18, 0, Math.PI * 2);
  ctx.fillStyle = orb.glowColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius + 8, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(120, 255, 120, 0.45)";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
  ctx.fillStyle = orb.color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(orb.x - 5, orb.y - 5, 7, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
}

function drawMonkey(monkey) {
  // wings
  ctx.fillStyle = "rgba(210,210,210,0.55)";
  ctx.fillRect(monkey.x - 8, monkey.y + 8, 8, 10);
  ctx.fillRect(monkey.x + monkey.width, monkey.y + 8, 8, 10);

  // body
  ctx.fillStyle = monkey.color;
  ctx.fillRect(monkey.x, monkey.y, monkey.width, monkey.height);

  // ears
  ctx.fillStyle = "#3a2418";
  ctx.fillRect(monkey.x + 4, monkey.y - 4, 6, 6);
  ctx.fillRect(monkey.x + monkey.width - 10, monkey.y - 4, 6, 6);

  // face
  ctx.fillStyle = "#d7b08a";
  ctx.fillRect(monkey.x + 8, monkey.y + 10, 24, 16);

  // eyes
  ctx.fillStyle = "white";
  ctx.fillRect(monkey.x + 11, monkey.y + 12, 5, 5);
  ctx.fillRect(monkey.x + 24, monkey.y + 12, 5, 5);

  ctx.fillStyle = "black";
  ctx.fillRect(monkey.x + 13, monkey.y + 14, 2, 2);
  ctx.fillRect(monkey.x + 26, monkey.y + 14, 2, 2);

  // mouth
  ctx.fillStyle = "#5a2a1a";
  ctx.fillRect(monkey.x + 17, monkey.y + 20, 6, 2);
}

// =======================
// PLAYER + COMPANIONS
// =======================
const dorothy = new CanvasObject({
  x: 110,
  y: 430,
  width: 32,
  height: 24,
  pixelSize: 2,
  pixels: [
    "....eee.........",
    "...eeeee........",
    "..eeddddee......",
    "..eddddddee.....",
    ".eeddddddee.....",
    ".eedfdfddee.....",
    ".eeddddddee.....",
    ".eeddddddee.....",
    ".eedfddfdee.....",
    ".eeddddddde.....",
    ".ee..111..ee....",
    ".ee..111..ee...."
  ],
  colors: {
    e: "#f2c6a0",
    d: "#66a9ff",
    f: "#000000",
    1: "#8b5a2b"
  },
  kind: "pixel"
});

const scarecrow = new CanvasObject({
  x: 60,
  y: 70,
  width: 20,
  height: 10,
  pixelSize: 2,
  pixels: [
    "...7777...",
    "..777777..",
    "..755557..",
    "..5ffff5..",
    "..555555.."
  ],
  colors: {
    7: "#a67c52",
    5: "#c2a36b",
    f: "#000000"
  },
  message: "I want a brain",
  kind: "pixel"
});

const tinMan = new CanvasObject({
  x: 330,
  y: 85,
  width: 18,
  height: 8,
  pixelSize: 2,
  pixels: [
    "...ddd...",
    "..bdddb..",
    "..dfffd..",
    "..ddddd.."
  ],
  colors: {
    d: "#c0c0c0",
    b: "#888888",
    f: "#000000"
  },
  message: "I want a heart",
  kind: "pixel"
});

const lion = new CanvasObject({
  x: 560,
  y: 90,
  width: 18,
  height: 8,
  pixelSize: 2,
  pixels: [
    "...eeee...",
    "..e4444e..",
    "..45ff54..",
    "..455554.."
  ],
  colors: {
    e: "#d19a3c",
    4: "#b8792a",
    5: "#e0a84f",
    f: "#000000"
  },
  message: "I want courage",
  kind: "pixel"
});

// =======================
// ENEMIES
// =======================
const orb = new CanvasObject({
  x: 420,
  y: 300,
  width: 42,
  height: 42,
  radius: 21,
  color: "rgba(57, 255, 20, 0.95)",
  glowColor: "rgba(57, 255, 20, 0.35)",
  speedX: 0,
  speedY: 0,
  kind: "orb"
});

const monkeys = [
  new CanvasObject({
    x: 140,
    y: 170,
    width: 40,
    height: 40,
    color: "#5b3a29",
    speedX: 2,
    speedY: 1.5,
    kind: "monkey"
  }),
  new CanvasObject({
    x: 620,
    y: 150,
    width: 40,
    height: 40,
    color: "#6b442f",
    speedX: -2.4,
    speedY: 1.3,
    kind: "monkey"
  }),
  new CanvasObject({
    x: 500,
    y: 420,
    width: 40,
    height: 40,
    color: "#4a2d1f",
    speedX: 1.8,
    speedY: -2,
    kind: "monkey"
  })
];

const goal = {
  x: 660,
  y: 24,
  width: 112,
  height: 84
};

// =======================
// GAME STATE
// =======================
let collisionFlashFrames = 0;
let win = false;

// =======================
// RESET
// =======================
function resetGame() {
  dorothy.resetPosition();
  dorothy.setScale(1);

  orb.resetPosition();
  orb.setScale(1);
  orb.speedX = 0;
  orb.speedY = 0;

  monkeys[0].x = 140;
  monkeys[0].y = 170;
  monkeys[0].speedX = 2;
  monkeys[0].speedY = 1.5;

  monkeys[1].x = 620;
  monkeys[1].y = 150;
  monkeys[1].speedX = -2.4;
  monkeys[1].speedY = 1.3;

  monkeys[2].x = 500;
  monkeys[2].y = 420;
  monkeys[2].speedX = 1.8;
  monkeys[2].speedY = -2;

  collisionFlashFrames = 0;
  win = false;
}

// =======================
// DRAWING
// =======================
function drawBackground() {
  if (images.path.complete) {
    ctx.drawImage(images.path, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#b8e986";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (collisionFlashFrames > 0) {
    ctx.fillStyle = "rgba(255, 105, 180, 0.28)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillRect(12, 12, 150, 84);
  if (images.intro.complete) {
    ctx.drawImage(images.intro, 18, 18, 138, 72);
  }

  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.fillRect(goal.x - 6, goal.y - 6, goal.width + 12, goal.height + 12);
  if (images.city.complete) {
    ctx.drawImage(images.city, goal.x, goal.y, goal.width, goal.height);
  } else {
    ctx.fillStyle = "#74df77";
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
  }

  ctx.fillStyle = "#133c13";
  ctx.font = "bold 16px Comic Sans MS";
  ctx.fillText("Reach Emerald City!", 600, 126);
}

function drawHud() {
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(12, 548, 360, 38);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Comic Sans MS";
  ctx.fillText("Move: Arrow Keys or WASD | Avoid monkeys + orb!", 22, 572);

  if (win) {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillRect(160, 240, 480, 110);
    ctx.strokeStyle = "#125f12";
    ctx.lineWidth = 3;
    ctx.strokeRect(160, 240, 480, 110);
    ctx.fillStyle = "#125f12";
    ctx.font = "bold 30px Comic Sans MS";
    ctx.fillText("You made it to Emerald City!", 192, 286);
    ctx.font = "18px Comic Sans MS";
    ctx.fillText("Press Restart Game to play again.", 246, 322);
  }
}

function drawCompanions() {
  scarecrow.draw();
  tinMan.draw();
  lion.draw();
  scarecrow.drawSpeechBubble();
  tinMan.drawSpeechBubble();
  lion.drawSpeechBubble();
}

// =======================
// GAME LOGIC
// =======================
function updatePlayerMovement() {
  const moveSpeed = 4;
  if (keys.ArrowUp || keys.w || keys.W) dorothy.y -= moveSpeed;
  if (keys.ArrowDown || keys.s || keys.S) dorothy.y += moveSpeed;
  if (keys.ArrowLeft || keys.a || keys.A) dorothy.x -= moveSpeed;
  if (keys.ArrowRight || keys.d || keys.D) dorothy.x += moveSpeed;
  dorothy.clampToCanvas();
}

function updateOrbAttack() {
  const dorothyCenterX = dorothy.x + dorothy.width / 2;
  const dorothyCenterY = dorothy.y + dorothy.height / 2;
  const dx = dorothyCenterX - orb.x;
  const dy = dorothyCenterY - orb.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    const chaseSpeed = 1.45;
    orb.speedX = (dx / distance) * chaseSpeed;
    orb.speedY = (dy / distance) * chaseSpeed;
  }

  orb.updatePosition();
  orb.clampToCanvas();
}

function updateMonkeys() {
  for (const monkey of monkeys) {
    monkey.updatePosition();
    monkey.bounceOnEdges();
  }
}

function updateCollisionEffects() {
  let monkeyHit = false;
  for (const monkey of monkeys) {
    if (hasCollided(dorothy, monkey)) {
      monkeyHit = true;
    }
  }

  const orbHit = circleRectCollision(orb, dorothy);
  const playerHit = orbHit || monkeyHit;

  if (playerHit) {
    collisionFlashFrames = 12;
    dorothy.setScale(1.35);
    orb.setScale(1.35);
    for (const monkey of monkeys) {
      monkey.setScale(1.18);
    }
  } else if (collisionFlashFrames === 0) {
    dorothy.setScale(1);
    orb.setScale(1);
    for (const monkey of monkeys) {
      monkey.setScale(1);
    }
  }

  if (collisionFlashFrames > 0) {
    collisionFlashFrames -= 1;
    if (collisionFlashFrames === 0) {
      dorothy.setScale(1);
      orb.setScale(1);
      for (const monkey of monkeys) {
        monkey.setScale(1);
      }
    }
  }
}

function updateWinState() {
  if (hasCollided(dorothy, goal)) {
    win = true;
  }
}

// =======================
// ANIMATION LOOP
// =======================
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!win) {
    updatePlayerMovement();
    updateOrbAttack();
    updateMonkeys();
    updateCollisionEffects();
    updateWinState();
  }

  drawCompanions();
  dorothy.draw();

  for (const monkey of monkeys) {
    monkey.draw();
  }

  orb.draw();
  drawHud();

  requestAnimationFrame(animate);
}

// =======================
// EVENTS
// =======================
window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

playMusicBtn.addEventListener("click", () => {
  bgMusic.play().catch(() => {
    console.log("Audio playback was blocked until user interaction.");
  });
});

pauseMusicBtn.addEventListener("click", () => {
  bgMusic.pause();
});

restartBtn.addEventListener("click", resetGame);

// =======================
// START
// =======================
resetGame();
animate();
