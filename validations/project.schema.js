const Joi = require("joi");

const projectschema = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  managerId: Joi.number().required(),
});

module.exports = projectschema;
