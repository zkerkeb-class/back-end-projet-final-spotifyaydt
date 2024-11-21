// src/models/Playlist.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

// Définition du modèle "Playlist"
const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Track', // Liste des pistes audio de la playlist
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Exportation du modèle
export default model('Playlist', playlistSchema);
