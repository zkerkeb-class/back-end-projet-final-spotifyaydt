import Joi from 'joi';

// Schémas de validation
export const createAlbumSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  artist: Joi.string().required(),
  releaseDate: Joi.date().iso().required(),
  genre: Joi.string().required(),
  coverImage: Joi.string().uri(),
  tracks: Joi.array().items(Joi.string()),
  description: Joi.string().max(500),
});

export const updateAlbumSchema = Joi.object({
  title: Joi.string().min(1).max(100),
  artist: Joi.string(),
  releaseDate: Joi.date().iso(),
  genre: Joi.string(),
  coverImage: Joi.string().uri(),
  tracks: Joi.array().items(Joi.string()),
  description: Joi.string().max(500),
}).min(1);

// Fonction de validation sans paramètre `isUpdate`
export const validateAlbum = (req, res, next) => {
  // Vérifie si la méthode HTTP est POST ou PUT pour déterminer le schéma
  const schema = req.method === 'POST' ? createAlbumSchema : updateAlbumSchema;

  const { error } = schema.validate(req.body);

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({ message: errorMessage });
  }

  next(); // Validation réussie, passe au middleware suivant
};
