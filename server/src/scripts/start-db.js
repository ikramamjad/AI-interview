const path = require("path");
const fs = require("fs");
const Postgres = require("embedded-postgres").default;

const DB_DIR = path.join(__dirname, "..", "..", "data", "db");
const PORT = 5432;
const USER = "postgres";
const PASSWORD = "password";
const DB_NAME = "interview_platform";

async function main() {
  console.log(`[Embedded Postgres] Setting up database in: ${DB_DIR}`);

  const pg = new Postgres({
    databaseDir: DB_DIR,
    port: PORT,
    user: USER,
    password: PASSWORD,
    authMethod: "password",
    persistent: true,
    onLog: (msg) => {
      // Filter noisy logs
      if (msg.includes("LOG:") || msg.includes("ready to accept connections")) {
        console.log(`[Postgres] ${msg.trim()}`);
      }
    },
    onError: (err) => {
      console.error("[Postgres Error]", err);
    },
  });

  const isInitialized = fs.existsSync(path.join(DB_DIR, "PG_VERSION"));
  if (!isInitialized) {
    console.log("[Embedded Postgres] Initializing cluster for first run...");
    await pg.initialise();
    console.log("[Embedded Postgres] Initialization complete.");
  } else {
    console.log("[Embedded Postgres] Existing cluster detected.");
  }

  console.log(`[Embedded Postgres] Starting server on port ${PORT}...`);
  await pg.start();
  console.log(`[Embedded Postgres] Server is running on port ${PORT}.`);

  // Ensure DB_NAME exists
  try {
    console.log(`[Embedded Postgres] Ensuring database '${DB_NAME}' exists...`);
    await pg.createDatabase(DB_NAME);
    console.log(`[Embedded Postgres] Database '${DB_NAME}' created.`);
  } catch (err) {
    if (err.message && (err.message.includes("already exists") || err.code === "42P04")) {
      console.log(`[Embedded Postgres] Database '${DB_NAME}' already exists.`);
    } else {
      console.log(`[Embedded Postgres] Database check: ${err.message}`);
    }
  }

  console.log(`[Embedded Postgres] Ready! Connect via: postgresql://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}`);

  // Keep process running if executed directly
  process.on("SIGINT", async () => {
    console.log("\nStopping Postgres...");
    await pg.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nStopping Postgres...");
    await pg.stop();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[Embedded Postgres] Failed to start:", err);
    process.exit(1);
  });
}

module.exports = { main };
