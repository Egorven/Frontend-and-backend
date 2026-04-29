
const { createClient } = require('redis');

const redisClient = createClient({
    url: "redis://127.0.0.1:6379"
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

async function initRedis() {
    await redisClient.connect();
    console.log("Redis connected");
}

function cacheMiddleware(keyBuilder, ttl) {
    return async (req, res, next) => {
        try {
            const key = keyBuilder(req);
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                return res.json({
                    source: "cache",
                    data: JSON.parse(cachedData)
                });
            }
            req.cacheKey = key;
            req.cacheTTL = ttl;
            next();
        } catch (err) {
            console.error("Cache read error:", err);
            next();
        }
    };
}
async function saveToCache(key, data, ttl) {
    try {
        await redisClient.set(key, JSON.stringify(data), {
            EX: ttl
        });
    } catch (err) {
        console.error("Cache save error:", err);
    }
}
// Удаление кэша пользователей
async function invalidateUsersCache(userId = null) {
    try {
        await redisClient.del("users:all");
        if (userId) {
            await redisClient.del(`users:${userId}`);
        }
    } catch (err) {
        console.error("Users cache invalidate error:", err);
    }
}

module.exports = { cacheMiddleware, invalidateUsersCache, saveToCache,  initRedis, redisClient };