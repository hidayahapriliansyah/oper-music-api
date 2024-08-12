const Joi = require('joi');

const createOrUpdateAlbumRequestSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

module.exports = { createOrUpdateAlbumRequestSchema };
