const InvariantError = require('../../exceptions/InvariantError');
const {
  userSignInRequestSchema,
  getNewAcccessTokenSchema,
  deleteAuthenticationSchema,
} = require('./schema');

const AuthenticationssValidator = {
  userSignInPayload: (payload) => {
    const validationResult = userSignInRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  getNewAcccessTokenPayload: (payload) => {
    const validationResult = getNewAcccessTokenSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  deleteAuthenticationPayload: (payload) => {
    const validationResult = deleteAuthenticationSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationssValidator;
