import Joi from 'joi';

export const createAlbumSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  artist: Joi.string().required(),
  releaseDate: Joi.date().iso().required(),
  genre: Joi.string().required(),
  imageUrl: Joi.string().uri(),
  tracks: Joi.array().items(Joi.string()),
  description: Joi.string().max(500),
});

export const updateAlbumSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  artist: Joi.string(),
  releaseDate: Joi.date().iso(),
  genre: Joi.string(),
  imageUrl: Joi.string().uri(),
  tracks: Joi.array().items(Joi.string()),
  description: Joi.string().max(500),
}).min(1);
