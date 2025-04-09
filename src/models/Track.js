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
    audioUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
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
    coverImage: {
      type: String, // URL de l'image de couverture
      default: '',
    },
    lyrics: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

trackSchema.pre('find', function (next) {
  this.executionStartTime = Date.now();
  next();
});

trackSchema.post('find', function () {
  logger.info(`La recherche a pris ${Date.now() - this.executionStartTime}ms`);
  const executionTime = Date.now() - this.executionStartTime;
  if (executionTime > 1000) {
    logger.info('Recherche longue');
  }
});

export default model('Track', trackSchema);
