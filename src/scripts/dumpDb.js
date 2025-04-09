import { spawn } from 'child_process'; // Pour exécuter la commande `mongodump`
import archiver from 'archiver'; // Pour créer un fichier ZIP
import zlib from 'zlib'; // Pour créer un fichier GZ
import { s3Client, S3_CONFIG, generateS3Key } from '../config/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import logger from '../config/logger.js';
import connectToDb from '../config/db.js'; // Connexion à MongoDB

// Connexion à MongoDB
connectToDb()
  .then(() => {
    logger.info('🔄 Connexion à la base de données établie avec succès.');
  })
  .catch((err) => {
    logger.error('❌ Erreur de connexion à la base de données :', err);
  });

// Fonction pour effectuer le dump de MongoDB vers un flux et compresser
const dumpAndCompressToS3 = async (compressionType = 'gzip') => {
  try {
    // Créer une clé S3 unique pour le dump compressé
    const s3Key = generateS3Key('mongo-dump', `dump-${Date.now()}.${compressionType}`);

    // Lancer la commande mongodump
    const mongodump = spawn('mongodump', [
      '--archive', // Utilise le mode archive pour un seul fichier
      '--gzip', // Par défaut, on utilise gzip pour la compression
      '--uri', // URI de connexion MongoDB
      process.env.MONGO_URI, // URI de connexion MongoDB
    ]);

    // Créer le flux de compression (ZIP ou GZ)
    const compressionStream =
      compressionType === 'zip' ? archiver('zip', { zlib: { level: 9 } }) : zlib.createGzip();

    // Envoie les données du dump directement vers le flux de compression
    mongodump.stdout.pipe(compressionStream);

    // Préparer l'upload vers S3
    const uploadParams = {
      Bucket: S3_CONFIG.bucketName,
      Key: s3Key,
      Body: compressionStream, // Le flux compressé
      ContentType: compressionType === 'zip' ? 'application/zip' : 'application/gzip',
      CacheControl: 'public, max-age=31536000',
    };

    // Envoie le dump compressé directement vers S3
    logger.info('Début de lupload du dump MongoDB compressé vers S3');
    await s3Client.send(new PutObjectCommand(uploadParams));
    logger.info(`Le dump MongoDB compressé a été uploadé avec succès vers S3 sous ${s3Key}`);

    // Générer l'URL CloudFront
    const cloudfrontDomain = process.env.CLOUDFRONT_URL.replace(/\/+$/, '');
    const cloudfrontUrl = `${cloudfrontDomain}/${s3Key.replace(/^\/+/, '')}`;

    return {
      fileUrl: cloudfrontUrl,
      s3Key: s3Key,
    };
  } catch (error) {
    logger.error('Erreur lors du dump MongoDB compressé vers S3:', error);
    throw error;
  }
};

// Lancer le processus de dump, compression et upload vers S3
dumpAndCompressToS3('gzip') // 'zip' ou 'gzip'
  .then((result) => {
    logger.info(`URL du dump MongoDB compressé : ${result.fileUrl}`);
  })
  .catch((error) => {
    logger.error('Erreur lors du dump MongoDB compressé:', error);
  });
