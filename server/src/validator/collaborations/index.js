const InvariantError = require('../../exceptions/InvariantError');
const {
  addUserAsCollaboratorRequestSchema,
  deleteUserFromCollaboratorRequestSchema,
} = require('./schema');

const CollaborationsValidator = {
  addUserAsCollaboratorPayload: (payload) => {
    const validationResult = addUserAsCollaboratorRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  deleteUserFromCollaboratorPayload: (payload) => {
    const validationResult = deleteUserFromCollaboratorRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = CollaborationsValidator;
