const Joi = require("joi");

const taskschema = Joi.object().keys({
  title: Joi.string().required(),
  status: Joi.string().valid("pending", "in progress", "complete"),
  assignedto: Joi.required(),
  projectId: Joi.required(),
});

module.exports = taskschema;
