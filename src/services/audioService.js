import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { Readable, PassThrough } from 'stream';
import { Buffer } from 'buffer';
import logger from '../config/logger.js';

// Configuration du chemin ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath.path);

export const convertToWAV = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const outputStream = new PassThrough(); // Stream de sortie
    const outputBuffer = [];

    const readableStream = new Readable();
    readableStream.push(inputBuffer);
    readableStream.push(null);

    ffmpeg(readableStream)
      .format('wav') // Format WAV
      .audioCodec('pcm_u8') // Codec audio pour WAV
      .audioFrequency(22050)
      .audioChannels(1) // Passer en mono
      .on('error', (err) => reject(err))
      .pipe(outputStream); // Rediriger la sortie vers un stream

    outputStream.on('data', (chunk) => outputBuffer.push(chunk));
    outputStream.on('end', () => {
      resolve({
        buffer: Buffer.concat(outputBuffer),
        extension: 'wav',
        contentType: 'audio/wav',
      });
    });
  });
};

// Obtenir la durée d'un fichier audio
export const getAudioDuration = async (buffer) => {
  return new Promise((resolve) => {
    // Créer un stream temporaire pour ffprobe
    const inputStream = new Readable();
    inputStream._read = () => {};
    inputStream.push(buffer);
    inputStream.push(null);

    ffmpeg.ffprobe(inputStream, (err, metadata) => {
      if (err) {
        logger.error('Erreur ffprobe:', { error: err.message });
        // En cas d'erreur, retourner une durée par défaut
        resolve(0);
        return;
      }
      resolve(Math.round(metadata.format.duration || 0));
    });
  });
};
