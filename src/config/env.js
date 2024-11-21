import { config } from 'dotenv';

// On récupère l'environnement dans lequel on se trouve
const environment = process.env.NODE_ENV || 'development';

let envFile;

// On détermine le fichier .env à utiliser en fonction de l'environnement
switch (environment) {
  case 'development':
    envFile = '.env.dev';
    break;
  case 'production':
    envFile = '.env.prod';
    break;
  default:
    envFile = '.env.dev';
    break;
}

// On charge les variables d'environnement du fichier .env
config({ path: envFile });

// Destructuration des variables d'environnement
const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_CLUSTER } = process.env;

// Si les variables ne sont pas définies, on lance une erreur
if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_CLUSTER) {
  throw new Error('Please provide env variables.');
}

// Configuration de la base de données
const commonConfig = {
  username: MONGODB_USER,
  password: MONGODB_PASSWORD,
  cluster: MONGODB_CLUSTER,
};

// Export de commonConfig
export { commonConfig };
