import { S3Client } from '@aws-sdk/client-s3';

// Configuration du client S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configuration générale
const S3_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_REGION,
};

// Fonction utilitaire pour nettoyer le nom du fichier
const cleanFileName = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-|-$/g, '') // Enlève les tirets au début et à la fin
    .toLowerCase(); // Convertit en minuscules
};

// Fonction utilitaire pour générer une clé S3 unique
const generateS3Key = (folder, originalFilename) => {
  const timestamp = Date.now();
  const cleanedFilename = cleanFileName(originalFilename);
  return `${folder}/${timestamp}-${cleanedFilename}`;
};

export { s3Client, S3_CONFIG, generateS3Key };
