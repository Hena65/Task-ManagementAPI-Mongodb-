const express = require("express");
const projectRouter = express.Router();
// const path=require('path')
// const fs=require('node:fs')
const Joi = require("joi");
const projectschema = require("../validations/project.schema.js");
// const userfile=path.join(__dirname,'../data/user.json')
// const projectfile=path.join(__dirname,'../data/project.json')
const project = require("../models/project");

projectRouter.get("/project", async (req, res, next) => {
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
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

projectRouter.post("/project", async (req, res, next) => {
  try {
    const { error, value } = projectschema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const newproject = await project.create(value);
    res.status(201).json(newproject);
  } catch (err) {
    next(err);
  }
});

projectRouter.put("/project/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedproject = await project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedproject) {
      return res.status(404).json({ message: "project not found" });
    }

    res.status(201).json(updatedproject);
  } catch (err) {
    next(err);
  }
});

projectRouter.delete("/project/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const deletedproject = await project.findByIdAndDeleted(id);
    if (!deletedproject)
      return res.status(404).json({ message: "project not found" });
    res.status(201).json(deletedproject);
  } catch (err) {
    next(err);
  }
});

module.exports = projectRouter;
