const Joi = require('joi');

const userSignInRequestSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const getNewAcccessTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const deleteAuthenticationSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { userSignInRequestSchema, getNewAcccessTokenSchema, deleteAuthenticationSchema };
