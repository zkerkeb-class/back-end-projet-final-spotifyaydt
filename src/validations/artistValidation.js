import Joi from 'joi';

export const createArtistSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  biography: Joi.string().max(1000),
  genres: Joi.array().items(Joi.string()),
  imageUrl: Joi.string().uri(),
  socialLinks: Joi.object({
    spotify: Joi.string().uri(),
    instagram: Joi.string().uri(),
    twitter: Joi.string().uri(),
    website: Joi.string().uri(),
  }),
});

export const updateArtistSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  biography: Joi.string().max(1000),
  genres: Joi.array().items(Joi.string()),
  imageUrl: Joi.string().uri(),
  socialLinks: Joi.object({
    spotify: Joi.string().uri(),
    instagram: Joi.string().uri(),
    twitter: Joi.string().uri(),
    website: Joi.string().uri(),
  }),
}).min(1);
