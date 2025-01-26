// src/models/Playlist.js
import { Schema as _Schema, model } from 'mongoose';
const Schema = _Schema;

const trackSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    artist: {
      type: Schema.Types.ObjectId,
      ref: 'Artist', // Relation avec l'artiste
      required: true, // Champ obligatoire
    },
    album: {
      type: Schema.Types.ObjectId,
      ref: 'Album', // Relation avec l'album
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // Durée en secondes
      required: true,
    },
    filePath: {
      type: String, // Chemin vers le fichier audio
      required: true,
    },
    listens: {
      type: Number,
      default: 0,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model('Track', trackSchema);
