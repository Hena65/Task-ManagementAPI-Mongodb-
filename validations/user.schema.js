const Joi = require("joi");
const userschema = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("admin", "user", "manager").required(),
  location: Joi.object({
    type: Joi.string().valid("Point").required(),

    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
});

module.exports = userschema;
