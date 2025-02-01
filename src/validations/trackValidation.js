import Joi from 'joi';

// La validation est maintenant optionnelle car nous générons les données manquantes
const trackSchema = Joi.object({
  title: Joi.string().trim(),
  artist: Joi.string(),
  album: Joi.string(),
  genre: Joi.string(),
  duration: Joi.number().min(0),
  releaseDate: Joi.date(),
}).unknown(true); // Permet des champs supplémentaires

export const validateTrack = (req, res, next) => {
  // Vérifier si un fichier a été uploadé pour la création
  if (req.method === 'POST' && !req.file) {
    return res.status(400).json({ message: 'Le fichier audio est requis' });
  }

  // Si des données sont fournies, les valider
  if (Object.keys(req.body).length > 0) {
    const { error } = trackSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return res.status(400).json({ errors });
    }
  }

  next();
};
