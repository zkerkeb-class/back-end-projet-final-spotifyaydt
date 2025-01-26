import Joi from 'joi';

export const createPlaylistSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  description: Joi.string().max(500),
  isPublic: Joi.boolean().default(true),
  imageUrl: Joi.string().uri(),
  tracks: Joi.array().items(Joi.string()),
  owner: Joi.string().required(),
});

export const updatePlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500),
  isPublic: Joi.boolean(),
  imageUrl: Joi.string().uri(),
  tracks: Joi.array().items(Joi.string()),
}).min(1);

export const addTrackSchema = Joi.object({
  trackId: Joi.string().required(),
});
