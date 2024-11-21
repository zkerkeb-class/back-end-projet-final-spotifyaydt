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
  },
  {
    timestamps: true, // Ajoute des champs createdAt et updatedAt
  },
);

// Exportation du modèle
export default model('Artist', artistSchema);
