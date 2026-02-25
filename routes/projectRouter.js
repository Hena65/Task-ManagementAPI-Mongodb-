const express = require("express");
const projectRouter = express.Router();
const {
  isAuthenticated,
  allowRoles,
} = require("../middlewares/auth.middleware.js");
const projectschema = require("../validations/project.schema.js");
const project = require("../models/project");
const { redisClient } = require("../config/redis.js");
const cachingData = require("../middlewares/cache.middleware.js");

async function invalidateprojectcache() {
  try {
    const keys = await redisClient.keys("cache:/project*");
    for (const key of keys) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error("error invalidating cache:", error);
  }
}
projectRouter.get(
  "/project",
  isAuthenticated,
  cachingData,
  async (req, res, next) => {
    try {
      const {
        name,
        sortBy = "createdAt",
        order = "desc",
        page = 1,
        limit = 5,
      } = req.query;
      const query = {};
      if (name) query.name = name;
      const projects = await project
        .find(query)
        .populate("managerId")
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      res.json({ fromCache: false, data: projects });
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.post(
  "/project",
  isAuthenticated,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { error, value } = projectschema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const newproject = await project.create(value);
      await invalidateprojectcache();
      res.status(201).json(newproject);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.put(
  "/project/:id",
  isAuthenticated,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedproject = await project.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedproject) {
        return res.status(404).json({ message: "project not found" });
      }
      await invalidateprojectcache();

      res.status(201).json(updatedproject);
    } catch (err) {
      next(err);
    }
  },
);

projectRouter.delete(
  "/project/:id",
  isAuthenticated,
  allowRoles("admin"),
  async (req, res, next) => {
    try {
      const id = req.params.id;
      const deletedproject = await project.findByIdAndDeleted(id);
      if (!deletedproject)
        return res.status(404).json({ message: "project not found" });
      await invalidateprojectcache();

      res.status(201).json(deletedproject);
    } catch (err) {
      next(err);
    }
  },
);

module.exports = projectRouter;
