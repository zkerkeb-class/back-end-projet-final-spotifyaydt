// src/models/Album.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

// Définition du modèle "Album"
const albumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'Artist', // Relation avec l'artiste
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Track', // Relation avec les pistes
      },
    ],
    coverImage: {
      type: String, // URL de l'image de couverture
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Exportation du modèle
export default model('Album', albumSchema);
