const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =======================
// CLASS
// =======================
class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.speedX = 0;
        this.speedY = 0;
        this.baseWidth = width;
        this.baseHeight = height;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // keep inside canvas
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) {
            this.x = canvas.width - this.width;
        }

        if (this.y < 0) this.y = 0;
        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// =======================
// HELPERS
// =======================
function drawPixelSprite(sprite) {
    const size = sprite.pixelSize;

    for (let row = 0; row < sprite.pixels.length; row++) {
        for (let col = 0; col < sprite.pixels[row].length; col++) {
            const val = sprite.pixels[row][col];

            if (val !== ".") {
                ctx.fillStyle = sprite.colors[val] || "black";
                ctx.fillRect(
                    sprite.x + col * size,
                    sprite.y + row * size,
                    size,
                    size
                );
            }
        }
    }
}

function drawSpeech(sprite) {
    ctx.fillStyle = "white";
    ctx.fillRect(sprite.x, sprite.y - 20, 120, 20);

    ctx.strokeStyle = "black";
    ctx.strokeRect(sprite.x, sprite.y - 20, 120, 20);

    ctx.fillStyle = "black";
    ctx.font = "10px Comic Sans MS";
    ctx.fillText(sprite.message, sprite.x + 5, sprite.y - 6);
}

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

function drawMonkey(monkey) {
    // body
    ctx.fillStyle = monkey.color;
    ctx.fillRect(monkey.x, monkey.y, monkey.width, monkey.height);

    // wings
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillRect(monkey.x - 8, monkey.y + 8, 8, 10);
    ctx.fillRect(monkey.x + monkey.width, monkey.y + 8, 8, 10);

    // eyes
    ctx.fillStyle = "white";
    ctx.fillRect(monkey.x + 8, monkey.y + 10, 6, 6);
    ctx.fillRect(monkey.x + 24, monkey.y + 10, 6, 6);

    ctx.fillStyle = "black";
    ctx.fillRect(monkey.x + 10, monkey.y + 12, 2, 2);
    ctx.fillRect(monkey.x + 26, monkey.y + 12, 2, 2);
}

// =======================
// PLAYER (DOROTHY)
// =======================
let dorothy = {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    baseWidth: 32,
    baseHeight: 32,
    pixelSize: 2,
    pixels: [
        "....eee........",
        "...eeeee.......",
        "..eeddddee.....",
        "..eddddddee....",
        ".eeddddddee....",
        ".eedfdfddee....",
        ".eeddddddee....",
        ".eeddddddee....",
        ".eedfddfdee....",
        ".eeddddddde....",
        ".ee..111..ee...",
        ".ee..111..ee..."
    ],
    colors: {
        e: "#f2c6a0",
        d: "#4a90e2",
        f: "#000000",
        1: "#8b5a2b"
    }
};

// =======================
// COMPANIONS
// =======================
let scarecrow = {
    x: 50,
    y: 50,
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
        f: "#000"
    },
    message: "I want a brain"
};

let tinMan = {
    x: 200,
    y: 100,
    pixelSize: 2,
    pixels: [
        "...ddd...",
        "..bdddb..",
        "..dfffd..",
        "..ddddd.."
    ],
    colors: {
        d: "#c0c0c0",
        b: "#888",
        f: "#000"
    },
    message: "I want a heart"
};

let lion = {
    x: 300,
    y: 200,
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
        f: "#000"
    },
    message: "I want courage"
};

// =======================
// MAIN ENEMY
// =======================
let enemy = new GameObject(400, 300, 60, 60, "red");
enemy.speedX = 3;
enemy.speedY = 2;

// =======================
// FLYING MONKEYS
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
// GLOWING ORB
// =======================
let orb = {
    x: 650,
    y: 450,
    radius: 22,
    color: "rgba(57, 255, 20, 0.95)",
    glowColor: "rgba(57, 255, 20, 0.35)",
    speed: 1.4
};

// =======================
// CONTROLS
// =======================
let keys = {};

window.addEventListener("keydown", function (e) {
    keys[e.key] = true;
});

window.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});

// =======================
// GAME STATE
// =======================
let bgColor = "lightgreen";
let collisionFlashTimer = 0;

// =======================
// GAME LOOP
// =======================
function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dorothy movement
    if (keys["ArrowUp"]) dorothy.y -= 4;
    if (keys["ArrowDown"]) dorothy.y += 4;
    if (keys["ArrowLeft"]) dorothy.x -= 4;
    if (keys["ArrowRight"]) dorothy.x += 4;

    // keep Dorothy in bounds
    dorothy.x = clamp(dorothy.x, 0, canvas.width - dorothy.width);
    dorothy.y = clamp(dorothy.y, 0, canvas.height - dorothy.height);

    // main enemy movement
    enemy.update();

    if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
        enemy.speedX *= -1;
    }

    if (enemy.y <= 0 || enemy.y + enemy.height >= canvas.height) {
        enemy.speedY *= -1;
    }

    // monkeys movement
    for (let monkey of monkeys) {
        monkey.update();

        if (monkey.x <= 0 || monkey.x + monkey.width >= canvas.width) {
            monkey.speedX *= -1;
        }

        if (monkey.y <= 0 || monkey.y + monkey.height >= canvas.height) {
            monkey.speedY *= -1;
        }
    }

    // orb chasing Dorothy
    let dx = dorothy.x + dorothy.width / 2 - orb.x;
    let dy = dorothy.y + dorothy.height / 2 - orb.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        orb.x += (dx / distance) * orb.speed;
        orb.y += (dy / distance) * orb.speed;
    }

    orb.x = clamp(orb.x, orb.radius, canvas.width - orb.radius);
    orb.y = clamp(orb.y, orb.radius, canvas.height - orb.radius);

    // collision checks
    let monkeyHit = false;
    for (let monkey of monkeys) {
        if (hasCollided(dorothy, monkey)) {
            monkeyHit = true;
        }
    }

    let enemyHit = hasCollided(dorothy, enemy);
    let orbHit = circleRectCollision(orb, dorothy);
    let playerHit = enemyHit || monkeyHit || orbHit;

    // collision effects
    if (playerHit) {
        bgColor = "#ffd6f5";
        collisionFlashTimer = 10;

        dorothy.width = 50;
        dorothy.height = 50;

        enemy.width = enemy.baseWidth + 20;
        enemy.height = enemy.baseHeight + 20;
    } else {
        if (collisionFlashTimer > 0) {
            collisionFlashTimer--;
        } else {
            bgColor = "lightgreen";
        }

        dorothy.width = dorothy.baseWidth;
        dorothy.height = dorothy.baseHeight;

        enemy.width = enemy.baseWidth;
        enemy.height = enemy.baseHeight;
    }

    // background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // title text
    ctx.fillStyle = "gold";
    ctx.font = "24px Comic Sans MS";
    ctx.fillText("Follow the Emerald Path!", 250, 35);

    // draw player + enemies
    drawPixelSprite(dorothy);
    enemy.draw();

    for (let monkey of monkeys) {
        drawMonkey(monkey);
    }

    drawOrb(orb);

    // draw companions
    drawPixelSprite(scarecrow);
    drawPixelSprite(tinMan);
    drawPixelSprite(lion);

    drawSpeech(scarecrow);
    drawSpeech(tinMan);
    drawSpeech(lion);

    requestAnimationFrame(updateGame);
}

// =======================
// MUSIC
// =======================
function playMusic() {
    const music = document.getElementById("music") || document.getElementById("bgMusic");
    if (music) {
        music.play();
    }
}

// =======================
// START
// =======================
updateGame();
