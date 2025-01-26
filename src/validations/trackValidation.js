import Joi from 'joi';

export const createTrackSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  artist: Joi.string().required(),
  album: Joi.string().required(),
  duration: Joi.number().required().min(0),
  genre: Joi.string().required(),
  releaseDate: Joi.date().iso(),
  audioUrl: Joi.string().uri().required(),
  imageUrl: Joi.string().uri(),
});

export const updateTrackSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  artist: Joi.string(),
  album: Joi.string(),
  duration: Joi.number().min(0),
  genre: Joi.string(),
  releaseDate: Joi.date().iso(),
  audioUrl: Joi.string().uri(),
  imageUrl: Joi.string().uri(),
}).min(1);
