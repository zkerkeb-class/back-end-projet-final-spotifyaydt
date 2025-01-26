import Joi from 'joi';

const trackSchema = Joi.object({
  title: Joi.string().required().trim().messages({
    'string.empty': 'Le titre est requis',
    'any.required': 'Le titre est requis',
  }),
  artist: Joi.string().required().messages({
    'string.empty': 'Lartiste est requis',
    'any.required': 'Lartiste est requis',
  }),
  album: Joi.string().required().messages({
    'string.empty': 'Lalbum est requis',
    'any.required': 'Lalbum est requis',
  }),
  genre: Joi.string().required().messages({
    'string.empty': 'Le genre est requis',
    'any.required': 'Le genre est requis',
  }),
  duration: Joi.number().required().min(0).messages({
    'number.base': 'La durée doit être un nombre',
    'number.min': 'La durée doit être positive',
    'any.required': 'La durée est requise',
  }),
  releaseDate: Joi.date().required().messages({
    'date.base': 'La date de sortie doit être une date valide',
    'any.required': 'La date de sortie est requise',
  }),
});

export const validateTrack = (req, res, next) => {
  // Vérifier si un fichier a été uploadé pour la création
  if (req.method === 'POST' && !req.file) {
    return res.status(400).json({ message: 'Le fichier audio est requis' });
  }

  const { error } = trackSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }

  next();
};
