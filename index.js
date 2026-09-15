const mineflayer = require("mineflayer");

const HOST = "Bharosa0Smp.aternos.me";
const PORT = 11964;
const USERNAME = process.env.BOT_USERNAME || "BharosaAFK";

const RECONNECT_DELAY = 10000;

let bot = null;
let reconnectTimer = null;
let movementTimer = null;
let chatTimer = null;
let lookTimer = null;

let connected = false;
let movementIndex = 0;
let chatIndex = 0;

const messages = [
  "Bharosa SMP OP!",
  "Hello everyone!",
  "Anyone online?",
  "Bharosa SMP 🔥"
];

function createBot() {
  console.log(`Connecting to ${HOST}:${PORT}...`);

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: "26.2",
    auth: "offline"
  });

  bot.once("spawn", () => {
    connected = true;

    console.log("✅ Bot joined Bharosa SMP");

    startMovement();
    startChat();
    startLooking();
  });

  bot.on("chat", (username, message) => {
    console.log(`[CHAT] ${username}: ${message}`);

    if (username === bot.username) return;

    if (message.toLowerCase() === "!ping") {
      bot.chat("Pong!");
    }

    if (message.toLowerCase() === "!status") {
      bot.chat(
        `Online | HP: ${Math.round(bot.health || 0)}`
      );
    }
  });

  bot.on("kicked", reason => {
    console.log("⚠️ Kicked:", reason);
  });

  bot.on("error", error => {
    console.log("❌ Error:", error.message);
  });

  bot.on("end", () => {
    connected = false;

    stopTimers();

    console.log("🔌 Disconnected.");

    scheduleReconnect();
  });
}

function startMovement() {
  clearInterval(movementTimer);

  const movements = [
    "forward",
    "left",
    "back",
    "right"
  ];

  movementTimer = setInterval(() => {
    if (!bot || !bot.entity || !connected) return;

    bot.clearControlStates();

    const direction =
      movements[movementIndex % movements.length];

    movementIndex++;

    console.log(`🚶 Moving: ${direction}`);

    bot.setControlState(direction, true);

    setTimeout(() => {
      if (!bot || !bot.entity) return;

      bot.setControlState(direction, false);
    }, 2500);

    if (movementIndex % 3 === 0) {
      setTimeout(() => {
        if (!bot || !bot.entity) return;

        bot.setControlState("jump", true);

        setTimeout(() => {
          if (bot) {
            bot.setControlState("jump", false);
          }
        }, 400);
      }, 700);
    }
  }, 5000);
}

function startLooking() {
  clearInterval(lookTimer);

  lookTimer = setInterval(async () => {
    if (!bot || !bot.entity || !connected) return;

    try {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * 0.5;

      await bot.look(yaw, pitch, false);

      console.log("👀 Looking around");
    } catch (error) {
      console.log("Look error:", error.message);
    }
  }, 7000);
}

function startChat() {
  clearInterval(chatTimer);

  chatTimer = setInterval(() => {
    if (!bot || !bot.entity || !connected) return;

    const message =
      messages[chatIndex % messages.length];

    chatIndex++;

    bot.chat(message);

    console.log(`💬 Bot: ${message}`);
  }, 10000);
}

function stopTimers() {
  clearInterval(movementTimer);
  clearInterval(chatTimer);
  clearInterval(lookTimer);

  movementTimer = null;
  chatTimer = null;
  lookTimer = null;
}

function scheduleReconnect() {
  if (reconnectTimer) return;

  console.log(
    `🔄 Reconnecting in ${RECONNECT_DELAY / 1000}s...`
  );

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, RECONNECT_DELAY);
}

process.on("SIGINT", () => {
  console.log("🛑 Shutting down...");

  stopTimers();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  if (bot) {
    bot.quit("Shutdown");
  }

  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("🛑 Terminating...");

  stopTimers();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  if (bot) {
    bot.quit("Shutdown");
  }

  process.exit(0);
});

process.on("uncaughtException", error => {
  console.log("❌ Uncaught:", error);
});

process.on("unhandledRejection", reason => {
  console.log("❌ Rejection:", reason);
});

console.log("================================");
console.log("     BHAROSA AFK BOT");
console.log("================================");
console.log("Version: 26.2");
console.log(`Server: ${HOST}:${PORT}`);
console.log("================================");

createBot();
