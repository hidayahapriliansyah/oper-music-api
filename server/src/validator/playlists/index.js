const InvariantError = require('../../exceptions/InvariantError');
const {
  createPlaylistRequestSchema,
  addSongToPlaylistRequestSchema,
  deleteSongFromPlaylistRequestSchema,
} = require('./schema');

const PlaylistsValidator = {
  createPlaylistPayload: (payload) => {
    const validationResult = createPlaylistRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  addSongToPlaylistPayload: (payload) => {
    const validationResult = addSongToPlaylistRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  deleteSongFromPlaylistPayload: (payload) => {
    const validationResult = deleteSongFromPlaylistRequestSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
