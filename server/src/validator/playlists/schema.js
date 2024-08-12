const Joi = require('joi');

const createPlaylistRequestSchema = Joi.object({
  name: Joi.string().required(),
});

const addSongToPlaylistRequestSchema = Joi.object({
  songId: Joi.string().required(),
});

const deleteSongFromPlaylistRequestSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  createPlaylistRequestSchema,
  addSongToPlaylistRequestSchema,
  deleteSongFromPlaylistRequestSchema,
};
