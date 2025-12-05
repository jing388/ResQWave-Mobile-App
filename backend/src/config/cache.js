const {LRUCache} = require("lru-cache");
const redis = require("./redis");

// Tiny in-process LRU for hottest keys
const lru = new LRUCache({
    max: 500,
    ttl: 1000 * 60,
});

let hits = 0;
let misses = 0;

// Circuit breaker state
let circuitOpen = false;
let failureCount = 0;
let lastFailureTime = 0;
const FAILURE_THRESHOLD = 5;
const RECOVERY_TIMEOUT = 60000; // 1 minute

function checkCircuitBreaker() {
    if (circuitOpen) {
        if (Date.now() - lastFailureTime > RECOVERY_TIMEOUT) {
            circuitOpen = false;
            failureCount = 0;
            console.log("Redis circuit breaker closed");
        } else {
            return false; // Circuit still open
        }
    }
    return true;
}

function recordFailure() {
    failureCount++;
    lastFailureTime = Date.now();
    if (failureCount >= FAILURE_THRESHOLD) {
        circuitOpen = true;
        console.log("Redis circuit breaker opened");
    }
}

function recordSuccess() {
    if (failureCount > 0) {
        failureCount = Math.max(0, failureCount - 1);
    }
}

async function getCache(key) {
  // Check LRU cache first
  const v = lru.get(key);
  if (v !== undefined) {
    console.log("CACHE HIT:", key);
    return v;
  }

  // Check circuit breaker before Redis call
  if (!checkCircuitBreaker()) {
    console.log("CACHE MISS (circuit open):", key);
    return null;
  }

  try {
    const raw = await redis.get(key);
    if (!raw) {
      console.log("CACHE MISS:", key);
      recordSuccess();
      return null;
    }
    console.log("CACHE HIT (redis):", key);
    const parsed = JSON.parse(raw);
    lru.set(key, parsed);
    recordSuccess();
    return parsed;
  } catch (error) {
    console.error("Cache get error:", error);
    recordFailure();
    return null;
  }
}

async function setCache(key, value, ttl = 60) {
  console.log("CACHE SET:", key);
  lru.set(key, value, { ttl: ttl * 1000 });

  // Check circuit breaker before Redis call
  if (!checkCircuitBreaker()) {
    console.log("CACHE SET (circuit open):", key);
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
    recordSuccess();
  } catch (error) {
    console.error("Cache set error:", error);
    recordFailure();
  }
}

async function deleteCache(patternOrKey) {
    // Always delete from LRU cache
    if (!patternOrKey.includes("*")) {
        lru.delete(patternOrKey);
    } else {
        // For patterns, we can't easily delete from LRU without scanning
        // This is acceptable since LRU cache is small and will expire naturally
    }

    // Check circuit breaker before Redis call
    if (!checkCircuitBreaker()) {
        console.log("CACHE DELETE (circuit open):", patternOrKey);
        return;
    }

    try {
        if (!patternOrKey.includes("*")) {
            await redis.del(patternOrKey);
            recordSuccess();
            return;
        }
        const stream = redis.scanStream({watch: patternOrKey, count: 100});
        for await (const keys of stream) {
            if (keys.length) {
                keys.forEach(k => lru.delete(k));
                await redis.del(keys);
            }
        }
        recordSuccess();
    } catch (error) {
        console.error("Cache delete error:", error);
        recordFailure();
    }
}

async function getCacheWithStats(key) {
  const v = await getCache(key);
  if (v) hits++; else misses++;
  return v;
}
function cacheStats() {
  return { hits, misses, ratio: hits / Math.max(1, hits + misses) };
}
module.exports = { getCache, setCache, deleteCache, getCacheWithStats, cacheStats };