const { redisClient } = require("../config/redis");
const ratelimit = require("express-rate-limit");
const redisStore = require("rate-limit-redis");

const limiter = ratelimit({
  store: new redisStore({
    client: redisClient,
  }),
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
