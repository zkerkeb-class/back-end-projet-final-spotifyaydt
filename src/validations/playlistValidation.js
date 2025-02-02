import Joi from 'joi';

export const createPlaylistSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
});

export const updatePlaylistSchema = Joi.object({
  tracks: Joi.array().items(Joi.string()),
}).min(1);

export const addTrackSchema = Joi.object({
  trackId: Joi.string().required(),
});

// Middleware de validation
export const validatePlaylist = (req, res, next) => {
  const { error } = createPlaylistSchema.validate(req.body); // Utilisation de Joi pour valider le corps de la requête
  if (error) {
    return res.status(400).json({ message: error.details[0].message }); // Retourner une erreur si la validation échoue
  }
  next(); // Si la validation réussit, passer à l'étape suivante
};
