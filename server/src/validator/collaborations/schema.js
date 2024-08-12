const Joi = require('joi');

const addUserAsCollaboratorRequestSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

const deleteUserFromCollaboratorRequestSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = {
  addUserAsCollaboratorRequestSchema,
  deleteUserFromCollaboratorRequestSchema,
};
