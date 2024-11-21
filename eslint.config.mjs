import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Règles générales
  {
    languageOptions: {
      globals: {
        node: 'readonly', // Définit l'environnement Node.js
        es2021: 'readonly', // Utilisation d'ES2021
        jest: 'readonly', // Si tu utilises Jest pour les tests
      },
      parserOptions: {
        ecmaVersion: 'latest', // Utilisation de la dernière version ECMAScript
        sourceType: 'module', // Utilisation des modules ES
      },
    },
  },
  // Configuration des règles
  {
    plugins: {
      prettier: prettierPlugin, // Déclaration du plugin Prettier en tant qu'objet
    },
    rules: {
      strict: ['error', 'global'], // Imposer le mode strict
      'no-console': 'warn', // Avertir sur l'utilisation de `console`
      semi: ['error', 'always'], // Imposer les points-virgules
      quotes: ['error', 'single'], // Utiliser des guillemets simples
      'prettier/prettier': 'error', // Appliquer les règles Prettier comme erreurs
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Avertir sur les variables non utilisées
      eqeqeq: 'error', // Exiger l'utilisation de `===` et `!==`
      curly: ['error', 'all'], // Imposer les accolades autour des blocs conditionnels
      'brace-style': ['error', '1tbs'], // Utilisation du style d'accolades "1tbs"
    },
  },

  // Si tu veux des configurations supplémentaires pour Prettier
  {
    plugins: {
      prettier: prettierPlugin, // Utilisation du plugin Prettier
    },
    rules: {
      'prettier/prettier': 'error', // Applique Prettier comme règle de formatage
    },
  },
];
