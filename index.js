const mineflayer = require("mineflayer");

// ============================================================
// BHAROSA SMP - AFK / TEST BOT
// Minecraft Java 26.2
// ============================================================

// -------------------------
// SERVER CONFIG
// -------------------------

const HOST = "Bharosa0Smp.aternos.me";
const PORT = 11964;

const BOT_USERNAME =
  process.env.BOT_USERNAME || "BharosaAFK";

// -------------------------
// TIMING CONFIG
// -------------------------

const RECONNECT_DELAY = 10000;
const CHAT_INTERVAL = 10000;
const MOVEMENT_INTERVAL = 5000;
const LOOK_INTERVAL = 7000;
const STATUS_INTERVAL = 30000;

// -------------------------
// CHAT CONFIG
// -------------------------

const CHAT_MESSAGES = [
  "Bharosa SMP OP 🔥",
  "Anyone online?",
  "Bharosa SMP 😎",
  "Nice server!",
  "Hello everyone 👋"
];

// -------------------------
// VARIABLES
// -------------------------

let bot = null;

let reconnectTimer = null;
let chatTimer = null;
let movementTimer = null;
let lookTimer = null;
let statusTimer = null;

let shuttingDown = false;
let connected = false;

let movementIndex = 0;
let chatIndex = 0;

// ============================================================
// CREATE BOT
// ============================================================

function createBot() {
  if (shuttingDown) return;

  console.log("");
  console.log("========================================");
  console.log("      BHAROSA SMP BOT STARTING");
  console.log("========================================");
  console.log(`Host: ${HOST}`);
  console.log(`Port: ${PORT}`);
  console.log(`Username: ${BOT_USERNAME}`);
  console.log("Version: 26.2");
  console.log("========================================");
  console.log("");

  try {
    bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: BOT_USERNAME,
      version: "26.2",
      auth: "offline"
    });
  } catch (error) {
    console.log("❌ Failed to create bot:");
    console.log(error.message);

    scheduleReconnect();
    return;
  }

  setupEvents();
}

// ============================================================
// EVENTS
// ============================================================

function setupEvents() {

  // -------------------------
  // SPAWN
  // -------------------------

  bot.once("spawn", () => {
    connected = true;

    console.log("");
    console.log("========================================");
    console.log("✅ BOT JOINED SERVER");
    console.log("========================================");
    console.log(`Username: ${bot.username}`);
    console.log(`Server: ${HOST}:${PORT}`);
    console.log("========================================");
    console.log("");

    stopAllTimers();

    startMovement();
    startLooking();
    startChat();
    startStatus();

    setTimeout(() => {
      if (!bot || !bot.entity) return;

      console.log("👋 Bot is ready.");
    }, 3000);
  });

  // -------------------------
  // LOGIN
  // -------------------------

  bot.on("login", () => {
    console.log("🔐 Login successful.");
  });

  // -------------------------
  // CHAT
  // -------------------------

  bot.on("chat", (username, message) => {
    if (!username) return;

    console.log(`[CHAT] ${username}: ${message}`);

    if (username === bot.username) {
      return;
    }

    handleChatCommand(username, message);
  });

  // -------------------------
  // WHISPER
  // -------------------------

  bot.on("whisper", (username, message) => {
    console.log(`[WHISPER] ${username}: ${message}`);

    if (username === bot.username) {
      return;
    }

    if (message.toLowerCase() === "ping") {
      safeChat("Pong!");
    }
  });

  // -------------------------
  // KICK
  // -------------------------

  bot.on("kicked", (reason) => {
    connected = false;

    console.log("");
    console.log("========================================");
    console.log("⚠️ BOT KICKED");
    console.log("========================================");
    console.log(reason);
    console.log("========================================");
    console.log("");

    stopAllTimers();
  });

  // -------------------------
  // ERROR
  // -------------------------

  bot.on("error", (error) => {
    console.log("");
    console.log("❌ BOT ERROR");
    console.log(error.message);
    console.log("");
  });

  // -------------------------
  // END
  // -------------------------

  bot.on("end", () => {
    connected = false;

    console.log("");
    console.log("🔌 Connection closed.");

    stopAllTimers();

    if (!shuttingDown) {
      scheduleReconnect();
    }
  });

  // -------------------------
  // DEATH
  // -------------------------

  bot.on("death", () => {
    console.log("💀 Bot died.");

    setTimeout(() => {
      if (!bot || !bot.entity) return;

      console.log("🔄 Bot respawning...");
      bot.respawn();
    }, 3000);
  });

  // -------------------------
  // HEALTH
  // -------------------------

  bot.on("health", () => {
    if (!bot) return;

    if (bot.health <= 5) {
      console.log(
        `❤️ Low health: ${bot.health}`
      );
    }
  });

  // -------------------------
  // PLAYER JOIN
  // -------------------------

  bot.on("playerJoined", (player) => {
    if (!player || !player.username) return;

    console.log(
      `➕ Player joined: ${player.username}`
    );
  });

  // -------------------------
  // PLAYER LEAVE
  // -------------------------

  bot.on("playerLeft", (player) => {
    if (!player || !player.username) return;

    console.log(
      `➖ Player left: ${player.username}`
    );
  });
}

// ============================================================
// CHAT COMMANDS
// ============================================================

function handleChatCommand(username, message) {

  const command = message
    .trim()
    .toLower
