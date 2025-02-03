import fs from 'fs-extra';
import path from 'path';
import cron from 'node-cron';

// Utilisation de import.meta.url pour obtenir le répertoire du fichier courant
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Spécifie le répertoire des fichiers temporaires
const tempDir = path.join(__dirname, '..', 'temp'); // Le dossier où tes fichiers temporaires sont stockés
console.log('Chemin complet du répertoire temporaire :', tempDir);

// Fonction de nettoyage des fichiers temporaires
const cleanTempFiles = async () => {
  try {
    // Vérifier si le répertoire temp existe, sinon le créer
    const dirExists = await fs.pathExists(tempDir);
    if (!dirExists) {
      console.log(`Le répertoire ${tempDir} n'existe pas, création du répertoire.`);
      await fs.mkdirp(tempDir); // Crée le répertoire et ses parents s'ils n'existent pas
    } else {
      console.log(`Le répertoire ${tempDir} existe déjà.`);
    }

    // Lis les fichiers dans le répertoire temporaire, y compris les fichiers cachés
    const files = await fs.readdir(tempDir, { withFileTypes: true });
    console.log(
      `Fichiers trouvés dans ${tempDir}: ${files.length > 0 ? files.map((file) => file.name).join(', ') : 'aucun fichier'}`
    );

    // Si aucun fichier, afficher un message
    if (files.length === 0) {
      console.log('Aucun fichier temporaire à nettoyer.');
    }

    // Parcours tous les fichiers
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(tempDir, file.name);
        const stats = await fs.stat(filePath);

        // Afficher la date de dernière modification
        console.log(`Fichier : ${file.name} - Dernière modification : ${new Date(stats.mtimeMs)}`);

        // Supprimer les fichiers de plus de 24 heures (86400000 ms)
        if (Date.now() - stats.mtimeMs > 86400000) {
          await fs.remove(filePath); // Supprime le fichier
          console.log(`Fichier temporaire supprimé : ${file.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur de nettoyage des fichiers temporaires :', error);
  }
};

// Planifier la tâche de nettoyage tous les jours à minuit (00:00)
cron.schedule('0 0 * * *', cleanTempFiles);

// Appeler immédiatement pour tester le nettoyage des fichiers
cleanTempFiles();

// Exporte la fonction pour être utilisée ailleurs si besoin
export default cleanTempFiles;
