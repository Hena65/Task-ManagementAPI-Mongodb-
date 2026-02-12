const Joi=require('joi')
const userschema=Joi.object().keys({
    name:Joi.string().required(),
    email:Joi.string().email().required(),
    role:Joi.string().valid('admin','user','manager').required()
})

module.exports=userschema;