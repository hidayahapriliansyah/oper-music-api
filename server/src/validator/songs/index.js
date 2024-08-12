const InvariantError = require('../../exceptions/InvariantError');
const { createOrUpdateSongRequestSchema } = require('./schema');

const SongsValidator = {
  validateCreateOrUpdateSongPayload: (payload) => {
    const validationResult = createOrUpdateSongRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
