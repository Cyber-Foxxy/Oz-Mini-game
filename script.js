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
images.path.src = "images/yellow-brick-road.webp";
images.intro.src = "images/wizard-of-oz.webp";
images.city.src = "images/emerald-castle.jpg";

class CanvasObject {
  constructor({ x, y, width, height, color, speedX = 0, speedY = 0, pixelSize = 0, pixels = [], colors = {}, message = "", kind = "rect" }) {
    this.x = x;
    this.y = y;
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
  }

  updatePosition() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  clampToCanvas() {
    if (this.x < 0) this.x = 0;
    if (this.y < 0) this.y = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    if (this.y + this.height > canvas.height) this.y = canvas.height - this.height;
  }

  bounceOnEdges() {
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
  }

  draw() {
    if (this.kind === "pixel") {
      this.drawPixelSprite();
    } else {
      this.drawRect();
    }
  }
  function drawOrb(orb) {
    // outer glow
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius + 18, 0, Math.PI * 2);
    ctx.fillStyle = orb.glowColor;
    ctx.fill();

    // middle glow
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(120, 255, 120, 0.45)";
    ctx.fill();

    // core
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fillStyle = orb.color;
    ctx.fill();

    // bright center
    ctx.beginPath();
    ctx.arc(orb.x - 5, orb.y - 5, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fill();
}

  drawRect() {
    const gradient = ctx.createRadialGradient(
      this.x + this.width / 2,
      this.y + this.height / 2,
      6,
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 1.2
    );
    gradient.addColorStop(0, "#fff7c7");
    gradient.addColorStop(1, this.color);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
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

const orb = new CanvasObject({
  x: 420,
  y: 300,
  width: 42,
  height: 42,
  color: "#d414ff",
  speedX: 3,
  speedY: 2,
  kind: "rect"
  // =======================
// FLYING MONKEY OBSTACLES
// =======================
let monkeys = [
    new GameObject(150, 180, 40, 40, "#5b3a29"),
    new GameObject(620, 120, 40, 40, "#6b442f"),
    new GameObject(500, 420, 40, 40, "#4a2d1f")
];

monkeys[0].speedX = 2;
monkeys[0].speedY = 1.5;

monkeys[1].speedX = -2.5;
monkeys[1].speedY = 1.2;

monkeys[2].speedX = 1.8;
monkeys[2].speedY = -2;

// =======================
// GLOWING ORB ENEMY
// =======================
let orb = {
    x: 650,
    y: 450,
    radius: 22,
    color: "rgba(57, 255, 20, 0.95)",
    glowColor: "rgba(57, 255, 20, 0.35)",
    speed: 1.4
};

let playerHit = false;
let hitTimer = 0;
});

const goal = {
  x: 660,
  y: 24,
  width: 112,
  height: 84
};

let collisionFlashFrames = 0;
let win = false;

function hasCollided(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
    function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function circleRectCollision(circle, rect) {
    const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
    const closestY = clamp(circle.y, rect.y, rect.y + rect.height);

    const dx = circle.x - closestX;
    const dy = circle.y - closestY;

    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}
  );
}

function resetGame() {
  dorothy.x = 110;
  dorothy.y = 430;
  dorothy.setScale(1);
  orb.x = 420;
  orb.y = 300;
  orb.speedX = 3;
  orb.speedY = 2;
  orb.setScale(1);
  collisionFlashFrames = 0;
  win = false;
}

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
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(12, 548, 295, 38);
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Comic Sans MS";
  ctx.fillText("Move: Arrow Keys or WASD | Avoid the orb!", 22, 572);

  if (win) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(180, 248, 440, 92);
    ctx.strokeStyle = "#125f12";
    ctx.lineWidth = 3;
    ctx.strokeRect(180, 248, 440, 92);
    ctx.fillStyle = "#125f12";
    ctx.font = "bold 30px Comic Sans MS";
    ctx.fillText("You made it to Emerald City!", 212, 290);
    ctx.font = "18px Comic Sans MS";
    ctx.fillText("Press Restart Game to play again.", 265, 320);
  }
}

function updatePlayerMovement() {
  const moveSpeed = 4;
  if (keys.ArrowUp || keys.w || keys.W) dorothy.y -= moveSpeed;
  if (keys.ArrowDown || keys.s || keys.S) dorothy.y += moveSpeed;
  if (keys.ArrowLeft || keys.a || keys.A) dorothy.x -= moveSpeed;
  if (keys.ArrowRight || keys.d || keys.D) dorothy.x += moveSpeed;
  dorothy.clampToCanvas();
}

function updateCollisionEffects() {
  if (hasCollided(dorothy, orb)) {
    collisionFlashFrames = 12;
    dorothy.setScale(1.35);
    orb.setScale(1.35);
  } else if (collisionFlashFrames === 0) {
    dorothy.setScale(1);
    orb.setScale(1);
  }

  if (collisionFlashFrames > 0) {
    collisionFlashFrames -= 1;
    if (collisionFlashFrames === 0) {
      dorothy.setScale(1);
      orb.setScale(1);
    }
  }
}

function updateWinState() {
  const goalBox = {
    x: goal.x,
    y: goal.y,
    width: goal.width,
    height: goal.height
  };
  if (hasCollided(dorothy, goalBox)) {
    win = true;
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

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!win) {
    updatePlayerMovement();
    orb.updatePosition();
    orb.bounceOnEdges();
    updateCollisionEffects();
    updateWinState();
  }

  drawCompanions();
  dorothy.draw();
  orb.draw();
  drawHud();

  requestAnimationFrame(animate);
}

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

resetGame();
animate();
