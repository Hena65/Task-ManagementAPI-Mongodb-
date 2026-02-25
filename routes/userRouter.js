const express = require("express");
const userRouter = express.Router();
const { redisClient } = require("../config/redis");
const cachingData = require("../middlewares/cache.middleware.js");
// const userschema = require("../validations/user.schema.js");
const user = require("../models/user");
const {
  isAuthenticated,
  allowRoles,
} = require("../middlewares/auth.middleware.js");

async function invalidateUsercache() {
  try {
    const keys = await redisClient.keys("cache:/user*");
    for (const key of keys) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error("error invalidating cache:", error);
  }
}
userRouter.get(
  "/user",
  isAuthenticated,
  cachingData,
  async (req, res, next) => {
    try {
      const {
        role,
        sortBy = "createdAt",
        order = "asc",
        page = 1,
        limit = 5,
      } = req.query;
      const query = {};
      if (role) query.role = role;
      const users = await user
        .find(query)
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

      res.json({ fromCache: false, data: users });
    } catch (err) {
      next(err);
    }
  },
);

// userRouter.post("/user", async (req, res, next) => {
//   try {
//     const { error, value } = userschema.validate(req.body);
//     if (error) return res.status(400).json({ error: error.details[0].message });
//     const [longitude, latitude] = value.location.coordinates;

//     const newuser = await user.create(value);

//     const nearbyusers = await user.findOne({
//       _id: { $ne: newuser._id },
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [longitude, latitude],
//           },
//           $maxDistance: 15000,
//         },
//       },
//     });
//     await invalidateUsercache();
//     res.status(201).json({ newuser, nearbyusers });
//   } catch (err) {
//     next(err);
//   }
// });

userRouter.delete(
  "/user/:id",
  isAuthenticated,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleteduser = await user.findByIdAndDelete(id);
      if (!deleteduser) {
        return res.status(404).json({ message: "user not found" });
      }
      await invalidateUsercache();

      res.json(deleteduser);
    } catch (err) {
      next(err);
    }
  },
);

userRouter.put("/user/:id", isAuthenticated, async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateduser = await user.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updateduser) {
      return res.status(404).json({ message: "user not found" });
    }
    console.log(updateduser.description);
    await invalidateUsercache();

    res.status(200).json(updateduser);
  } catch (err) {
    next(err);
  }
});

module.exports = userRouter;
