import sharp from 'sharp';
import { s3Client, S3_CONFIG, generateS3Key } from '../config/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import logger from '../config/logger.js';

// Configuration des tailles d'images
const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 },
};

// Configuration des formats d'images
const IMAGE_FORMATS = ['webp'];

// Configuration de la qualité par format
const FORMAT_QUALITY = {
  webp: { quality: 80, effort: 6 }, // Effort: 0 (rapide) à 6 (meilleure compression)
};

/**
 * Traite une image en plusieurs formats et tailles
 * @param {Buffer} imageBuffer - Buffer de l'image originale
 * @param {string} fileName - Nom du fichier sans extension
 * @param {string} folder - Dossier de destination dans S3 (ex: 'artists', 'albums')
 * @returns {Promise<Object>} - URLs des différentes versions de l'image
 */
export const processImage = async (imageBuffer, fileName, folder) => {
  try {
    const results = {
      formats: {},
      originalFormat: null,
    };

    // Analyser l'image originale
    const metadata = await sharp(imageBuffer).metadata();
    results.originalFormat = metadata.format;

    // Traiter chaque format
    for (const format of IMAGE_FORMATS) {
      results.formats[format] = {};

      // Traiter chaque taille
      for (const [sizeName, dimensions] of Object.entries(IMAGE_SIZES)) {
        try {
          logger.info(`Traitement de l'image ${fileName} en ${format} - taille ${sizeName}`);

          // Traitement de l'image avec Sharp
          const processedImage = await sharp(imageBuffer)
            .resize(dimensions.width, dimensions.height, {
              fit: 'cover',
              position: 'centre',
            })
            [format](FORMAT_QUALITY[format])
            .toBuffer();

          // Générer une clé S3 unique pour cette version
          const s3Key = generateS3Key(`${folder}/${format}/${sizeName}`, `${fileName}.${format}`);

          // Configurer l'upload S3
          const uploadParams = {
            Bucket: S3_CONFIG.bucketName,
            Key: s3Key,
            Body: processedImage,
            ContentType: `image/${format}`,
            CacheControl: 'public, max-age=31536000',
          };

          // Upload vers S3
          await s3Client.send(new PutObjectCommand(uploadParams));

          // Générer l'URL CloudFront
          const cloudfrontDomain = process.env.CLOUDFRONT_URL.replace(/\/+$/, '');
          const cloudfrontUrl = `${cloudfrontDomain}/${s3Key.replace(/^\/+/, '')}`;

          // Stocker l'URL dans les résultats
          results.formats[format][sizeName] = {
            url: cloudfrontUrl,
            s3Key: s3Key,
          };

          logger.info(`Image ${fileName} traitée avec succès en ${format} - taille ${sizeName}`);
        } catch (error) {
          logger.error(
            `Erreur lors du traitement de l'image ${fileName} en ${format} - taille ${sizeName}:`,
            error
          );
          results.formats[format][sizeName] = { error: error.message };
        }
      }
    }

    return results;
  } catch (error) {
    logger.error(`Erreur lors du traitement de l'image ${fileName}:`, error);
    throw error;
  }
};
