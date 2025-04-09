// src/models/Artist.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

// Définition du modèle "Artiste"
const artistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // Un nom d'artiste doit être unique
      trim: true,
    },
    genre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    albums: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Album', // Relation avec l'album
      },
    ],
    popularity: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String, // URL de l'image de couverture
      default: '',
    },
  },
  {
    timestamps: true, // Ajoute des champs createdAt et updatedAt
  }
);

// Ajout d'un middleware pour mesurer le temps d'exécution de la recherche  d'artistes
artistSchema.pre('find', function (next) {
  this.executionStartTime = Date.now();
  next();
});

artistSchema.post('find', function () {
  logger.info(`La recherche a pris ${Date.now() - this.executionStartTime}ms`);
});

// Exportation du modèle
export default model('Artist', artistSchema);
