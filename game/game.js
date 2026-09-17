// --- OPPONENT CONFIGURATION (Generated via boxer-archetype-generator skill) ---
const OPPONENT_ROSTER = [
  {
    name: "Brick Brawler",
    archetype: "brawler",
    difficulty: "easy",
    health: 80,
    punchPower: 8,
    telegraphDurationMs: 750,
    attackCooldownMs: 1800,
    blockProbability: 0.1,
    roundDurationSec: 30,
    visuals: { gloveColor: "#f97316", shortsColor: "#1e293b" }
  },
  {
    name: "Silver Outfighter",
    archetype: "outfighter",
    difficulty: "easy",
    health: 105,
    punchPower: 11,
    telegraphDurationMs: 600,
    attackCooldownMs: 1450,
    blockProbability: 0.25,
    roundDurationSec: 30,
    visuals: { gloveColor: "#a78bfa", shortsColor: "#312e81" }
  },
  {
    name: "Counter Cobra",
    archetype: "counter-puncher",
    difficulty: "easy",
    health: 130,
    punchPower: 15,
    telegraphDurationMs: 500,
    attackCooldownMs: 1150,
    blockProbability: 0.4,
    roundDurationSec: 30,
    visuals: { gloveColor: "#22c55e", shortsColor: "#14532d" }
  },
  {
    name: "Iron Slugger",
    archetype: "slugger",
    difficulty: "medium",
    health: 165,
    punchPower: 20,
    telegraphDurationMs: 400,
    attackCooldownMs: 900,
    blockProbability: 0.5,
    roundDurationSec: 30,
    visuals: { gloveColor: "#ef4444", shortsColor: "#1e293b" }
  },
  {
    name: "Raging Brick",
    archetype: "brawler",
    difficulty: "medium",
    health: 145,
    punchPower: 17,
    telegraphDurationMs: 525,
    attackCooldownMs: 1050,
    blockProbability: 0.35,
    roundDurationSec: 30,
    visuals: { gloveColor: "#fb923c", shortsColor: "#431407" }
  },
  {
    name: "Phantom Footwork",
    archetype: "outfighter",
    difficulty: "medium",
    health: 155,
    punchPower: 18,
    telegraphDurationMs: 475,
    attackCooldownMs: 1000,
    blockProbability: 0.45,
    roundDurationSec: 30,
    visuals: { gloveColor: "#c084fc", shortsColor: "#581c87" }
  },
  {
    name: "Venom Counter",
    archetype: "counter-puncher",
    difficulty: "medium",
    health: 170,
    punchPower: 20,
    telegraphDurationMs: 425,
    attackCooldownMs: 900,
    blockProbability: 0.55,
    roundDurationSec: 30,
    visuals: { gloveColor: "#4ade80", shortsColor: "#166534" }
  },
  {
    name: "Steel Hammer",
    archetype: "slugger",
    difficulty: "hard",
    health: 180,
    punchPower: 22,
    telegraphDurationMs: 400,
    attackCooldownMs: 850,
    blockProbability: 0.6,
    roundDurationSec: 30,
    visuals: { gloveColor: "#f43f5e", shortsColor: "#4c0519" }
  },
  {
    name: "Titan Brawler",
    archetype: "brawler",
    difficulty: "hard",
    health: 190,
    punchPower: 23,
    telegraphDurationMs: 375,
    attackCooldownMs: 825,
    blockProbability: 0.65,
    roundDurationSec: 30,
    visuals: { gloveColor: "#fbbf24", shortsColor: "#713f12" }
  },
  {
    name: "The Final Bell",
    archetype: "outfighter",
    difficulty: "hard",
    health: 200,
    punchPower: 25,
    telegraphDurationMs: 350,
    attackCooldownMs: 800,
    blockProbability: 0.7,
    roundDurationSec: 30,
    visuals: { gloveColor: "#e879f9", shortsColor: "#701a75" }
  }
];

// Canvas & HUD Elements
const canvas = document.getElementById("ringCanvas");
const ctx = canvas.getContext("2d");
const playerHpBar = document.getElementById("player-hp");
const opponentHpBar = document.getElementById("opponent-hp");
const timerEl = document.getElementById("round-timer");
const opponentNameEl = document.getElementById("opponent-name");
const modalScreen = document.getElementById("modal-screen");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const startBtn = document.getElementById("start-btn");
const roundLabel = document.getElementById("round-label");

const zonePunch = document.getElementById("zone-punch");
const zoneGuard = document.getElementById("zone-guard");

let currentRound = 0;
let opponentConfig = OPPONENT_ROSTER[currentRound];
opponentNameEl.textContent = opponentConfig.name.toUpperCase();
roundLabel.textContent = `ROUND ${currentRound + 1}/${OPPONENT_ROSTER.length}`;

// Game State
let playerHP = 100;
let opponentHP = opponentConfig.health;
let timeLeft = opponentConfig.roundDurationSec;
let isPlaying = false;
let gameTimerInterval = null;
let lastOpponentActionTime = 0;

// Fighter Animation States
let playerState = "idle"; // idle | punch | guard
let opponentState = "idle"; // idle | telegraph | punch | guard
let hitSparks = [];

// --- INPUT LISTENERS (Pointer Events for Touch + Mouse) ---
zonePunch.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (!isPlaying || playerState === "guard") return;
  triggerPlayerPunch();
});

zoneGuard.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  if (!isPlaying) return;
  playerState = "guard";
  zoneGuard.classList.add("active");
});

const releaseGuard = (e) => {
  if (playerState === "guard") {
    playerState = "idle";
    zoneGuard.classList.remove("active");
  }
};
zoneGuard.addEventListener("pointerup", releaseGuard);
zoneGuard.addEventListener("pointerleave", releaseGuard);
zoneGuard.addEventListener("pointercancel", releaseGuard);

function triggerPlayerPunch() {
  playerState = "punch";
  setTimeout(() => {
    if (playerState === "punch") playerState = "idle";
  }, 180);

  // Hit determination
  const isOpponentGuarding = Math.random() < opponentConfig.blockProbability;
  if (isOpponentGuarding) {
    opponentState = "guard";
    createSpark(200, 200, "#facc15"); // yellow guard spark
    setTimeout(() => { if (opponentState === "guard") opponentState = "idle"; }, 250);
  } else {
    opponentHP = Math.max(0, opponentHP - 10);
    opponentHpBar.style.width = `${(opponentHP / opponentConfig.health) * 100}%`;
    createSpark(200, 190, "#ef4444"); // red hit spark

    if (opponentHP <= 0) {
      completeRound("KNOCKOUT! 🏆", "You defeated " + opponentConfig.name + "!");
    }
  }
}

function triggerOpponentPunch() {
  opponentState = "punch";
  setTimeout(() => {
    if (opponentState === "punch") opponentState = "idle";
  }, 220);

  if (playerState === "guard") {
    createSpark(200, 200, "#facc15");
    playerHP = Math.max(0, playerHP - 2); // chip damage
  } else {
    createSpark(200, 190, "#38bdf8");
    playerHP = Math.max(0, playerHP - opponentConfig.punchPower);
  }

  playerHpBar.style.width = `${Math.max(0, playerHP)}%`;

  if (playerHP <= 0) {
    endGame("KNOCKED OUT! 💥", opponentConfig.name + " knocked you down!");
  }
}

function updateOpponentAI(timestamp) {
  if (!isPlaying) return;

  if (opponentState === "idle" && timestamp - lastOpponentActionTime > opponentConfig.attackCooldownMs) {
    lastOpponentActionTime = timestamp;
    opponentState = "telegraph"; // visual cue before strike

    setTimeout(() => {
      if (isPlaying && opponentState === "telegraph") {
        triggerOpponentPunch();
      }
    }, opponentConfig.telegraphDurationMs);
  }
}

function createSpark(x, y, color) {
  hitSparks.push({ x, y, color, life: 10 });
}

// --- CANVAS RENDERING (Procedural Boxing Graphics) ---
function drawFighter(x, y, color, state, isFacingRight) {
  const dir = isFacingRight ? 1 : -1;
  const skin = "#f2b48b";
  const ink = "#111827";
  const glove = state === "guard" ? "#facc15" : color;
  const armY = y - 30;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Shadow
  ctx.fillStyle = "rgba(2, 6, 23, 0.45)";
  ctx.beginPath();
  ctx.ellipse(x, y + 47, 34, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs and shoes
  ctx.strokeStyle = ink;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, y - 1);
  ctx.lineTo(x - 15, y + 39);
  ctx.moveTo(x, y - 1);
  ctx.lineTo(x + 15, y + 39);
  ctx.stroke();
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 43);
  ctx.lineTo(x - 8, y + 43);
  ctx.moveTo(x + 8, y + 43);
  ctx.lineTo(x + 20, y + 43);
  ctx.stroke();

  // Shorts and torso
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 17, y - 7);
  ctx.lineTo(x + 17, y - 7);
  ctx.lineTo(x + 13, y + 18);
  ctx.lineTo(x + 2, y + 13);
  ctx.lineTo(x - 2, y + 13);
  ctx.lineTo(x - 13, y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(x - 2, y - 6, 4, 22);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 43);
  ctx.lineTo(x + 15, y - 43);
  ctx.lineTo(x + 13, y - 6);
  ctx.lineTo(x - 13, y - 6);
  ctx.closePath();
  ctx.fill();

  // Head, hair, eyes, and neck
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x, y - 61, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(x, y - 67, 16, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 4, y - 48, 8, 7);
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(x + dir * 8, y - 61, 2, 0, Math.PI * 2);
  ctx.fill();

  // Arms and gloves
  ctx.strokeStyle = skin;
  ctx.lineWidth = 8;
  ctx.beginPath();
  if (state === "punch") {
    ctx.moveTo(x + dir * 9, armY);
    ctx.lineTo(x + dir * 42, armY);
  } else if (state === "guard") {
    ctx.moveTo(x + dir * 9, armY);
    ctx.lineTo(x + dir * 16, y - 54);
  } else if (state === "telegraph") {
    ctx.moveTo(x + dir * 9, armY);
    ctx.lineTo(x - dir * 18, y - 40);
  } else {
    ctx.moveTo(x + dir * 9, armY);
    ctx.lineTo(x + dir * 22, y - 35);
  }
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  const gloveX = state === "punch" ? x + dir * 48 : state === "guard" ? x + dir * 17 : state === "telegraph" ? x - dir * 22 : x + dir * 24;
  const gloveY = state === "guard" ? y - 54 : state === "telegraph" ? y - 40 : armY;
  ctx.fillStyle = glove;
  ctx.beginPath();
  ctx.arc(gloveX, gloveY, state === "punch" ? 10 : 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function renderRing() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Arena lights and crowd
  const arenaGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  arenaGradient.addColorStop(0, "#172554");
  arenaGradient.addColorStop(0.56, "#0f172a");
  arenaGradient.addColorStop(1, "#020617");
  ctx.fillStyle = arenaGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(56, 189, 248, 0.1)";
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(150, 0);
  ctx.lineTo(245, 260);
  ctx.lineTo(155, 260);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(320, 0);
  ctx.lineTo(385, 0);
  ctx.lineTo(245, 260);
  ctx.lineTo(185, 260);
  ctx.closePath();
  ctx.fill();

  // Crowd silhouettes
  ctx.fillStyle = "#1e293b";
  for (let crowdX = 12; crowdX < canvas.width; crowdX += 24) {
    ctx.beginPath();
    ctx.arc(crowdX, 132 + (crowdX % 3) * 3, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ring floor and apron
  ctx.fillStyle = "#0b1120";
  ctx.fillRect(0, 300, canvas.width, 120);
  ctx.fillStyle = "#1e3a5f";
  ctx.beginPath();
  ctx.moveTo(30, 225);
  ctx.lineTo(370, 225);
  ctx.lineTo(350, 390);
  ctx.lineTo(50, 390);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Ring ropes and corner posts
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(20, 180 + i * 40);
    ctx.lineTo(380, 180 + i * 40);
    ctx.stroke();
  }
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(20, 170);
  ctx.lineTo(20, 330);
  ctx.moveTo(380, 170);
  ctx.lineTo(380, 330);
  ctx.stroke();

  // Draw Fighters
  drawFighter(154, 260, "#38bdf8", playerState, true);
  drawFighter(246, 260, opponentConfig.visuals.gloveColor, opponentState, false);

  // Sparks/Hits
  for (let i = hitSparks.length - 1; i >= 0; i--) {
    const s = hitSparks[i];
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.life * 1.5, 0, Math.PI * 2);
    ctx.fill();
    s.life--;
    if (s.life <= 0) hitSparks.splice(i, 1);
  }
}

function gameLoop(timestamp) {
  updateOpponentAI(timestamp);
  renderRing();
  if (isPlaying) requestAnimationFrame(gameLoop);
}

// --- GAME LIFECYCLE ---
function startGame() {
  opponentConfig = OPPONENT_ROSTER[currentRound];
  opponentNameEl.textContent = opponentConfig.name.toUpperCase();
  roundLabel.textContent = `ROUND ${currentRound + 1}/${OPPONENT_ROSTER.length}`;
  playerHP = 100;
  opponentHP = opponentConfig.health;
  timeLeft = opponentConfig.roundDurationSec;
  playerState = "idle";
  opponentState = "idle";
  hitSparks = [];

  playerHpBar.style.width = "100%";
  opponentHpBar.style.width = "100%";
  timerEl.textContent = timeLeft;

  modalScreen.classList.add("hidden");
  isPlaying = true;
  lastOpponentActionTime = performance.now();

  clearInterval(gameTimerInterval);
  gameTimerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      if (playerHP > opponentHP) {
        completeRound("DECISION WIN! 🥇", "Time expired! You landed more clean hits.");
      } else {
        endGame("DECISION LOSS! ⏱️", "Time expired! " + opponentConfig.name + " controlled the round.");
      }
    }
  }, 1000);

  requestAnimationFrame(gameLoop);
}

function endGame(title, message) {
  isPlaying = false;
  clearInterval(gameTimerInterval);
  roundIsReady = false;
  modalTitle.textContent = title;
  modalDesc.innerHTML = `${message}<br/><br/><strong>Tap Restart to Fight Again.</strong>`;
  startBtn.textContent = "RESTART";
  modalScreen.classList.remove("hidden");
}

let roundIsReady = false;

function completeRound(title, message) {
  if (currentRound === OPPONENT_ROSTER.length - 1) {
    endGame("CAMPAIGN COMPLETE! 🏆", message + " You conquered every archetype!");
    return;
  }

  currentRound++;
  roundIsReady = true;
  isPlaying = false;
  clearInterval(gameTimerInterval);
  modalTitle.textContent = title;
  modalDesc.innerHTML = `${message}<br/><br/><strong>Next up:</strong> ${OPPONENT_ROSTER[currentRound].name} (${OPPONENT_ROSTER[currentRound].difficulty})`;
  startBtn.textContent = "NEXT ROUND";
  modalScreen.classList.remove("hidden");
}

startBtn.addEventListener("click", () => {
  if (!roundIsReady) currentRound = 0;
  roundIsReady = false;
  startGame();
});
renderRing();
