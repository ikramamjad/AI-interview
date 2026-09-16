const Redis = require("ioredis");

let redisClient;
let isMock = false;

// In-memory fallback if Redis is unavailable
class InMemoryRedis {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
  }

  _isExpired(key) {
    if (!this.ttls.has(key)) return false;
    if (Date.now() > this.ttls.get(key)) {
      this.store.delete(key);
      this.ttls.delete(key);
      return true;
    }
    return false;
  }

  async get(key) {
    if (this._isExpired(key)) return null;
    return this.store.get(key) || null;
  }

  async set(key, value, ...args) {
    this.store.set(key, String(value));
    if (args.length >= 2 && String(args[0]).toUpperCase() === "EX") {
      const seconds = parseInt(args[1], 10);
      this.ttls.set(key, Date.now() + seconds * 1000);
    }
    return "OK";
  }

  async incr(key) {
    if (this._isExpired(key)) {
      this.store.delete(key);
    }
    const current = parseInt(this.store.get(key) || "0", 10);
    const next = current + 1;
    this.store.set(key, String(next));
    return next;
  }

  async expire(key, seconds) {
    if (!this.store.has(key) || this._isExpired(key)) return 0;
    this.ttls.set(key, Date.now() + seconds * 1000);
    return 1;
  }

  async ttl(key) {
    if (!this.store.has(key) || this._isExpired(key)) return -2;
    const expiresAt = this.ttls.get(key);
    if (!expiresAt) return -1;
    return Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
  }

  async del(key) {
    const existed = this.store.delete(key);
    this.ttls.delete(key);
    return existed ? 1 : 0;
  }

  async ping() {
    return "PONG (mock)";
  }

  get status() {
    return "ready (mock)";
  }
}

const redisUrl = process.env.REDIS_URL;

if (redisUrl && process.env.NODE_ENV === "production") {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 100, 1000);
    },
  });
  redisClient.on("error", (err) => {
    console.warn("Redis connection error:", err.message);
  });
} else if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    redisClient.connect().catch(() => {
      console.warn("Could not connect to Redis at", redisUrl, "- falling back to in-memory store.");
      redisClient = new InMemoryRedis();
      isMock = true;
    });
  } catch {
    redisClient = new InMemoryRedis();
    isMock = true;
  }
} else {
  console.log("No REDIS_URL provided. Using in-memory store for session locks and violation counts.");
  redisClient = new InMemoryRedis();
  isMock = true;
}

module.exports = redisClient;
