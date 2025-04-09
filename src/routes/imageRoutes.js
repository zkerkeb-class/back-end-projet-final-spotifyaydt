import express from 'express';
import multer from 'multer';
import { processImage } from '../services/imageService.js';

const router = express.Router();

// Configuration du middleware multer pour gérer les fichiers
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route pour l'upload et le traitement de l'image
router.post('/', upload.single('image'), async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ error: 'Aucune image fournie.' });
  }

  const { originalname, buffer } = file;
  const fileName = originalname.split('.')[0]; // Nom du fichier sans extension
  const folder = 'images'; // Dossier dans S3 (à adapter selon le besoin)

  try {
    // Appel de la fonction pour traiter l'image
    const processedImages = await processImage(buffer, fileName, folder);

    // Retour des URLs des images traitées
    res.status(200).json({
      message: 'Image traitée et téléchargée avec succès.',
      data: processedImages,
    });
  } catch (error) {
    logger.error('Erreur lors du traitement de limage:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors du traitement de limage.' });
  }
});

export default router;
