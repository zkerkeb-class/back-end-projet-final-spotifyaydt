import fs from 'fs-extra';
import path from 'path';

// Utiliser import.meta.url pour obtenir le chemin du répertoire
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Spécifie le répertoire des fichiers temporaires
const tempDir = path.join(__dirname, '..', 'temp'); // Le dossier où tes fichiers temporaires sont stockés

// Fonction de nettoyage des fichiers temporaires
const cleanTempFiles = async () => {
  try {
    // Vérifier si le répertoire temp existe, sinon le créer
    const dirExists = await fs.pathExists(tempDir);
    if (!dirExists) {
      console.log(`Le répertoire ${tempDir} n'existe pas, création du répertoire.`);
      await fs.mkdirp(tempDir); // Crée tous les répertoires parents s'ils n'existent pas
    }

    // Lis les fichiers dans le répertoire temporaire
    const files = await fs.readdir(tempDir);

    // Parcours tous les fichiers avec une boucle for...of pour gérer async correctement
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      // Supprimer les fichiers de plus de 24 heures (86400000 ms)
      if (Date.now() - stats.mtimeMs > 86400000) {
        await fs.remove(filePath); // Supprime le fichier
        console.log(`Fichier temporaire supprimé : ${file}`);
      }
    }
  } catch (error) {
    console.error('Erreur de nettoyage des fichiers temporaires :', error);
  }
};

// Appeler la fonction de nettoyage immédiatement pour tester
cleanTempFiles();
