const Redis = require("ioredis");

const redis = new Redis(
    process.env.REDIS_URL || {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
});

redis.on("connect", () => console.log("Redis Connected"));
redis.on("error", (err) => console.error("Redis Error:", err));
redis.on("close", () => console.log("Redis Connection Closed"));
redis.on("reconnecting", () => console.log("Redis Reconnecting..."));

module.exports = redis;