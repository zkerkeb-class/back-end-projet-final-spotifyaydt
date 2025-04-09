export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Données invalides',
        errors,
      });
    }

    next();
  };
};
