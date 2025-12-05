const Redis = require("ioredis");

const redis = new Redis(
    process.env.REDIS_URL || {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    retryStrategy: (times) => {
        const delay = Math.min(times * 100, 3000);
        if (times > 10) {
            return null; // Stop retrying after 10 attempts
        }
        return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 15000,
    commandTimeout: 10000,
    lazyConnect: true,
    keepAlive: 300000, // Match Redis server's 300 seconds
    family: 4,
    enableReadyCheck: true,
    maxLoadingTimeout: 5000,
    // Connection pooling settings
    connectionName: 'resqwave-backend',
    // Buffer settings
    enableOfflineQueue: false,
    // Retry delays
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
    },
});

redis.on("connect", () => console.log("Redis Connected"));
redis.on("error", (err) => console.error("Redis Error:", err));
redis.on("close", () => console.log("Redis Connection Closed"));
redis.on("reconnecting", () => console.log("Redis Reconnecting..."));

// Graceful shutdown
process.on('SIGINT', () => {
    redis.disconnect();
    process.exit();
});

process.on('SIGTERM', () => {
    redis.disconnect();
    process.exit();
});

module.exports = redis;