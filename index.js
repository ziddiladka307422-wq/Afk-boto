const mineflayer = require("mineflayer");

// ============================================================
// BHAROSA SMP AFK TEST BOT
// Minecraft Java 26.2
// ============================================================

// -------------------------
// SERVER
// -------------------------

const HOST = "Bharosa0Smp.aternos.me";
const PORT = 11964;

const USERNAME =
  process.env.BOT_USERNAME || "BharosaAFK";

// -------------------------
// SETTINGS
// -------------------------

const RECONNECT_DELAY = 10000;
const CHAT_INTERVAL = 10000;
const MOVE_INTERVAL = 5000;
const LOOK_INTERVAL = 7000;
const STATUS_INTERVAL = 30000;

// -------------------------
// CHAT MESSAGES
// -------------------------

const CHAT_MESSAGES = [
  "Bharosa SMP OP!",
  "Hello everyone!",
  "Anyone online?",
  "Bharosa SMP 🔥",
  "Nice server!"
];

// -------------------------
// VARIABLES
// -------------------------

let bot = null;

let reconnectTimer = null;
let movementTimer = null;
let chatTimer = null;
let lookTimer = null;
let statusTimer = null;

let connected = false;
let shuttingDown = false;

let movementIndex = 0;
let chatIndex = 0;

// ============================================================
// CREATE BOT
// ============================================================

function createBot() {

  if (shuttingDown) {
    return;
  }

  console.log("");
  console.log("========================================");
  console.log("        BHAROSA SMP AFK BOT");
  console.log("========================================");
  console.log("Host     :", HOST);
  console.log("Port     :", PORT);
  console.log("Username :", USERNAME);
  console.log("Version  : 26.2");
  console.log("========================================");
  console.log("");

  try {

    bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: USERNAME,
      version: "26.2",
      auth: "offline"
    });

    registerEvents();

  } catch (error) {

    console.log("❌ Could not create bot");
    console.log(error.message);

    scheduleReconnect();
  }
}

// ============================================================
// EVENTS
// ============================================================

function registerEvents() {

  // -------------------------
  // LOGIN
  // -------------------------

  bot.on("login", () => {

    console.log("🔐 Login successful");

  });

  // -------------------------
  // SPAWN
  // -------------------------

  bot.once("spawn", () => {

    connected = true;

    console.log("");
    console.log("========================================");
    console.log("✅ BOT JOINED SERVER");
    console.log("========================================");
    console.log("Bot:", bot.username);
    console.log("Server:", HOST + ":" + PORT);
    console.log("========================================");
    console.log("");

    stopTimers();

    startMovement();
    startChat();
    startLook();
    startStatus();

  });

  // -------------------------
  // CHAT
  // -------------------------

  bot.on("chat", (username, message) => {

    if (!username) {
      return;
    }

    console.log(
      `[CHAT] ${username}: ${message}`
    );

    if (username === bot.username) {
      return;
    }

    handleCommand(username, message);
  });

  // -------------------------
  // WHISPER
  // -------------------------

  bot.on("whisper", (username, message) => {

    console.log(
      `[WHISPER] ${username}: ${message}`
    );

    if (
      message.toLowerCase() === "ping"
    ) {

      sendChat("Pong!");

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

    stopTimers();

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
  // DISCONNECT
  // -------------------------

  bot.on("end", () => {

    connected = false;

    console.log("");
    console.log("🔌 BOT DISCONNECTED");
    console.log("");

    stopTimers();

    if (!shuttingDown) {
      scheduleReconnect();
    }

  });

  // -------------------------
  // DEATH
  // -------------------------

  bot.on("death", () => {

    console.log("💀 Bot died");

    setTimeout(() => {

      if (!bot) {
        return;
      }

      if (!connected) {
        return;
      }

      try {

        bot.respawn();

        console.log("🔄 Respawn requested");

      } catch (error) {

        console.log(
          "Respawn error:",
          error.message
        );

      }

    }, 3000);

  });

  // -------------------------
  // HEALTH
  // -------------------------

  bot.on("health", () => {

    if (!bot) {
      return;
    }

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

    if (!player) {
      return;
    }

    if (!player.username) {
      return;
    }

    console.log(
      `➕ Player joined: ${player.username}`
    );

  });

  // -------------------------
  // PLAYER LEFT
  // -------------------------

  bot.on("playerLeft", (player) => {

    if (!player) {
      return;
    }

    if (!player.username) {
      return;
    }

    console.log(
      `➖ Player left: ${player.username}`
    );

  });

}

// ============================================================
// CHAT COMMANDS
// ============================================================

function handleCommand(username, message) {

  const command = message
    .trim()
    .toLowerCase();

  // -------------------------
  // PING
  // -------------------------

  if (command === "!ping") {

    sendChat("Pong!");

    return;
  }

  // -------------------------
  // BOT
  // -------------------------

  if (command === "!bot") {

    sendChat(
      "BharosaAFK is online."
    );

    return;
  }

  // -------------------------
  // HELLO
  // -------------------------

  if (command === "!hello") {

    sendChat(
      `Hello ${username}!`
    );

    return;
  }

  // -------------------------
  // STATUS
  // -------------------------

  if (command === "!status") {

    sendStatus();

    return;
  }

}

// ============================================================
// SEND CHAT
// ============================================================

function sendChat(message) {

  if (!bot) {
    return;
  }

  if (!bot.entity) {
    return;
  }

  if (!connected) {
    return;
  }

  try {

    bot.chat(message);

    console.log(
      `💬 Bot: ${message}`
    );

  } catch (error) {

    console.log(
      "Chat error:",
      error.message
    );

  }
}

// ============================================================
// AUTOMATIC CHAT
// ============================================================

function startChat() {

  if (chatTimer) {

    clearInterval(chatTimer);

  }

  chatIndex = 0;

  chatTimer = setInterval(() => {

    if (!bot) {
      return;
    }

    if (!bot.entity) {
      return;
    }

    if (!connected) {
      return;
    }

    if (
      CHAT_MESSAGES.length === 0
    ) {

      return;

    }

    const message =
      CHAT_MESSAGES[
        chatIndex %
        CHAT_MESSAGES.length
      ];

    chatIndex++;

    sendChat(message);

  }, CHAT_INTERVAL);
}

// ============================================================
// MOVEMENT
// ============================================================

function startMovement() {

  if (movementTimer) {

    clearInterval(movementTimer);

  }

  movementIndex = 0;

  movementTimer = setInterval(() => {

    if (!bot) {
      return;
    }

    if (!bot.entity) {
      return;
    }

    if (!connected) {
      return;
    }

    performMovement();

  }, MOVE_INTERVAL);
}

// ============================================================
// MOVEMENT PATTERN
// ============================================================

function performMovement() {

  if (!bot) {
    return;
  }

  if (!bot.entity) {
    return;
  }

  bot.clearControlStates();

  const patterns = [
    "forward",
    "back",
    "left",
    "right",
    "forward",
    "right",
    "back",
    "left"
  ];

  const movement =
    patterns[
      movementIndex %
      patterns.length
    ];

  movementIndex++;

  console.log(
    `🚶 Moving: ${movement}`
  );

  bot.setControlState(
    movement,
    true
  );

  setTimeout(() => {

    if (!bot) {
      return;
    }

    bot.setControlState(
      movement,
      false
    );

  }, 2500);

  // Simple jump occasionally
  if (
    movementIndex % 4 === 0
  ) {

    setTimeout(() => {

      if (!bot) {
        return;
      }

      if (!bot.entity) {
        return;
      }

      bot.setControlState(
        "jump",
        true
      );

      setTimeout(() => {

        if (!bot) {
          return;
        }

        bot.setControlState(
          "jump",
          false
        );

      }, 500);

    }, 1000);

  }

}

// ============================================================
// LOOK AROUND
// ============================================================

function startLook() {

  if (lookTimer) {

    clearInterval(lookTimer);

  }

  lookTimer = setInterval(() => {

    if (!bot) {
      return;
    }

    if (!bot.entity) {
      return;
    }

    if (!connected) {
      return;
    }

    lookAround();

  }, LOOK_INTERVAL);
}

// ============================================================
// LOOK FUNCTION
// ============================================================

async function lookAround() {

  if (!bot) {
    return;
  }

  if (!bot.entity) {
    return;
  }

  try {

    const yaw =
      Math.random() *
      Math.PI *
      2;

    const pitch =
      (Math.random() - 0.5) *
      0.5;

    await bot.look(
      yaw,
      pitch,
      false
    );

    console.log(
      "👀 Looking around"
    );

  } catch (error) {

    console.log(
      "Look error:",
      error.message
    );

  }
}

// ============================================================
// STATUS
// ============================================================

function startStatus() {

  if (statusTimer) {

    clearInterval(statusTimer);

  }

  statusTimer = setInterval(() => {

    if (!bot) {
      return;
    }

    if (!bot.entity) {
      return;
    }

    if (!connected) {
      return;
    }

    printStatus();

  }, STATUS_INTERVAL);
}

// ============================================================
// PRINT STATUS
// ============================================================

function printStatus() {

  if (!bot) {
    return;
  }

  const health =
    Math.round(
      bot.health || 0
    );

  const food =
    Math.round(
      bot.food || 0
    );

  let position = "Unknown";

  if (bot.entity) {

    const pos =
      bot.entity.position;

    position =
      `${Math.round(pos.x)}, ` +
      `${Math.round(pos.y)}, ` +
      `${Math.round(pos.z)}`;

  }

  console.log("");
  console.log("========================================");
  console.log("              BOT STATUS");
  console.log("========================================");
  console.log("Online   :", connected);
  console.log("Health   :", health);
  console.log("Food     :", food);
  console.log("Position :", position);
  console.log("========================================");
  console.log("");
}

// ============================================================
// CHAT STATUS
// ============================================================

function sendStatus() {

  if (!bot) {
    return;
  }

  const health =
    Math.round(
      bot.health || 0
    );

  sendChat(
    `Online | HP: ${health}`
  );
}

// ============================================================
// RECONNECT
// ============================================================

function scheduleReconnect() {

  if (shuttingDown) {
    return;
  }

  if (reconnectTimer) {
    return;
  }

  console.log(
    `🔄 Reconnecting in ${
      RECONNECT_DELAY / 1000
    } seconds...`
  );

  reconnectTimer = setTimeout(() => {

    reconnectTimer = null;

    if (shuttingDown) {
      return;
    }

    createBot();

  }, RECONNECT_DELAY);
}

// ============================================================
// STOP TIMERS
// ============================================================

function stopTimers() {

  if (chatTimer) {

    clearInterval(chatTimer);
    chatTimer = null;

  }

  if (movementTimer) {

    clearInterval(movementTimer);
    movementTimer = null;

  }

  if (lookTimer) {

    clearInterval(lookTimer);
    lookTimer = null;

  }

  if (statusTimer) {

    clearInterval(statusTimer);
    statusTimer = null;

  }

}

// ============================================================
// SHUTDOWN
// ============================================================

function shutdown() {

  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log("");
  console.log("🛑 Shutting down bot...");

  stopTimers();

  if (reconnectTimer) {

    clearTimeout(
      reconnectTimer
    );

    reconnectTimer = null;

  }

  if (bot) {

    try {

      bot.clearControlStates();

      bot.quit(
        "Bot shutting down"
      );

    } catch (error) {

      console.log(
        "Shutdown error:",
        error.message
      );

    }

  }

  setTimeout(() => {

    process.exit(0);

  }, 1000);
}

// ============================================================
// SIGINT
// ============================================================

process.on(
  "SIGINT",
  shutdown
);

// ============================================================
// SIGTERM
// ============================================================

process.on(
  "SIGTERM",
  shutdown
);

// ============================================================
// UNCAUGHT EXCEPTION
// ============================================================

process.on(
  "uncaughtException",
  (error) => {

    console.log("");
    console.log("========================================");
    console.log("❌ UNCAUGHT EXCEPTION");
    console.log("========================================");
    console.log(error);
    console.log("========================================");
    console.log("");

  }
);

// ============================================================
// UNHANDLED REJECTION
// ============================================================

process.on(
  "unhandledRejection",
  (reason) => {

    console.log("");
    console.log("========================================");
    console.log("❌ UNHANDLED REJECTION");
    console.log("========================================");
    console.log(reason);
    console.log("========================================");
    console.log("");

  }
);

// ============================================================
// START BOT
// ============================================================

console.log("");
console.log("========================================");
console.log("      BHAROSA AFK BOT v1.0");
console.log("========================================");
console.log("Starting bot...");
console.log("========================================");
console.log("");

createBot();
