const express = require("express");
const taskRouter = express.Router();
// const Joi=require('joi');
// const path=require('path')
// const fs=require('node:fs')
const taskschema = require("../validations/task.schema.js");
// const sort=require('../utils/sort')
// const filter=require('../utils/filter')
// const paginate=require('../utils/paginate')
// const taskfile=path.join(__dirname,'../data/task.json')
// const userfile=path.join(__dirname,'../data/user.json')
// const projectfile=path.join(__dirname,'../data/project.json')
const task = require("../models/task");

taskRouter.get("/task", async (req, res, next) => {
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
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

taskRouter.post("/task", async (req, res, next) => {
  try {
    const { error, value } = taskschema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newtask = await task.create(value);
    res.status(201).json(newtask);
  } catch (err) {
    next(err);
  }
});

taskRouter.put("/task/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedtask = task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedtask) {
      return res.status(404).json({ message: "task not found" });
    }
    res.status(200).json(updatedtask);
  } catch (err) {
    next(err);
  }
});

taskRouter.delete("/task/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedtask = await task.findByIdAndDelete(id);
    if (!deletedtask) {
      return res.status(404).json({ message: "task not found" });
    }
    res.status(201).json({ message: "deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = taskRouter;
