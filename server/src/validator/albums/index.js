const InvariantError = require('../../exceptions/InvariantError');
const { createOrUpdateAlbumRequestSchema } = require('./schema');

const AlbumsValidator = {
  validateCreateOrUpdateAlbumPayload: (payload) => {
    const validationResult = createOrUpdateAlbumRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AlbumsValidator;
