const { redisClient } = require("../config/redis");

async function cachingData(req, res, next) {
  if (req.method != "GET") {
    console.log("we only cache get requests!!");
    return next();
  }

  const key = `cache:${req.originalUrl}`;
  let results;
  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      results = JSON.parse(cachedData);
      return res.send({
        fromCache: true,
        data: results,
      });
    } else {
      const originaljson = res.json.bind(res);
      res.json = async (data) => {
        await redisClient.setEx(key, 60, JSON.stringify(data));
        originaljson(data);
      };
      next();
    }
  } catch (error) {
    console.error(error);
    next();
  }
}

module.exports = cachingData;
