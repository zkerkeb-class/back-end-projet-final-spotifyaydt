import multer from 'multer';

// Configuration de Multer pour stocker temporairement en mémoire
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les fichiers audio
const fileFilter = (req, file, cb) => {
  console.log('Multer fileFilter called');
  console.log('File details:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac'];

  if (allowedMimes.includes(file.mimetype)) {
    console.log('File type accepted');
    cb(null, true);
  } else {
    console.log('File type rejected');
    cb(new Error('Format de fichier non supporté. Utilisez MP3, WAV, OGG ou AAC.'), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite à 10MB
  },
});

// Middleware pour gérer les erreurs Multer
export const handleMulterError = (err, req, res, next) => {
  console.log('Multer error handler called');
  console.log('Error:', err);

  if (err instanceof multer.MulterError) {
    console.log('MulterError type:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(400)
        .json({ message: 'Le fichier est trop volumineux. Taille maximum : 10MB' });
    }
    return res.status(400).json({ message: 'Erreur lors de lupload du fichier' });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};
// Export du middleware pour l'upload de fichier unique
export const uploadAudio = upload.single('audio');
