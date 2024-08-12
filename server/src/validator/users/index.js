const InvariantError = require('../../exceptions/InvariantError');
const { signUpUserRequestSchema } = require('./schema');

const UsersValidator = {
  signUpUserPayload: (payload) => {
    const validationResult = signUpUserRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
