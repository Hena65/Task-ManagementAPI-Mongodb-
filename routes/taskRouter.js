const express = require("express");
const taskRouter = express.Router();
const taskschema = require("../validations/task.schema.js");
const task = require("../models/task");
const project = require("../models/project");

const { redisClient } = require("../config/redis");
const cachingData = require("../middlewares/cache.middleware.js");
const {
  isAuthenticated,
  allowRoles,
} = require("../middlewares/auth.middleware.js");
async function invalidatetaskcache() {
  try {
    const keys = await redisClient.keys("cache:/task*");
    for (const key of keys) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error("error invalidating cache", error);
  }
}
taskRouter.get(
  "/task",
  isAuthenticated,
  cachingData,
  async (req, res, next) => {
    try {
      const {
        title,
        sortBy = "assignedto",
        order = "desc",
        page = 1,
        limit = 5,
      } = req.query;
      const query = {};
      if (title) query.title = title;
      const tasks = await task
        .find(query)
        .populate("assignedto")
        .populate("projectId")
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
      res.json({ fromCache: false, data: tasks });
    } catch (err) {
      next(err);
    }
  },
);

taskRouter.post(
  "/task",
  isAuthenticated,
  allowRoles("admin", "member"),
  async (req, res, next) => {
    try {
      const { error, value } = taskschema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      if (
        req.session.role === "member" &&
        !project.members.includes(req.session.userid)
      ) {
        return res.status(403).json({ error: "not assigned this project" });
      }
      const newtask = await task.create(value);
      await invalidatetaskcache();
      res.status(201).json(newtask);
    } catch (err) {
      next(err);
    }
  },
);

taskRouter.put(
  "/task/:id",
  isAuthenticated,
  allowRoles("admin", "member"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (
        req.session.role === "member" &&
        !project.members.includes(req.session.userid)
      ) {
        return res.status(403).json({ error: "not assigned this project" });
      }
      const updatedtask = await task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!updatedtask) {
        return res.status(404).json({ message: "task not found" });
      }
      await invalidatetaskcache();

      res.status(200).json(updatedtask);
    } catch (err) {
      next(err);
    }
  },
);

taskRouter.delete(
  "/task/:id",
  isAuthenticated,
  allowRoles("admin", "member"),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (
        req.session.role === "member" &&
        !project.members.includes(req.session.userid)
      ) {
        return res.status(403).json({ error: "not assigned this project" });
      }
      const deletedtask = await task.findByIdAndDelete(id);
      if (!deletedtask) {
        return res.status(404).json({ message: "task not found" });
      }
      await invalidatetaskcache();

      res.status(200).json({ message: "deleted" });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = taskRouter;
